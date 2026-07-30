import { createHash } from 'node:crypto';

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(payload: unknown): void;
};

type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    emailVerified?: boolean;
    customAttributes?: string;
  }>;
};

const fallbackAdminEmails = [
  'biolabjahid@gmail.com',
  'sarkerramjan2015@gmail.com',
];

function parseBody(body: unknown) {
  if (typeof body === 'string') {
    return JSON.parse(body) as Record<string, unknown>;
  }

  if (body && typeof body === 'object') {
    return body as Record<string, unknown>;
  }

  return {};
}

function getBearerToken(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

function hasAdminClaim(customAttributes?: string) {
  if (!customAttributes) {
    return false;
  }

  try {
    const claims = JSON.parse(customAttributes) as Record<string, unknown>;
    return claims.admin === true;
  } catch {
    return false;
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const firebaseWebApiKey = process.env.FIREBASE_WEB_API_KEY;
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

  if (!cloudName || !apiKey || !apiSecret || !firebaseWebApiKey) {
    response.status(503).json({ error: 'Secure upload is not configured yet.' });
    return;
  }

  const idToken = getBearerToken(request.headers.authorization);
  if (!idToken) {
    response.status(401).json({ error: 'Admin login required.' });
    return;
  }

  const lookupResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseWebApiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!lookupResponse.ok) {
    response.status(401).json({ error: 'Admin session could not be verified.' });
    return;
  }

  const lookup = await lookupResponse.json() as FirebaseLookupResponse;
  const firebaseUser = lookup.users?.[0];
  const email = firebaseUser?.email?.trim().toLowerCase();
  const configuredEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const approvedEmails = new Set([...fallbackAdminEmails, ...configuredEmails]);
  const approvedByEmail = Boolean(firebaseUser?.emailVerified && email && approvedEmails.has(email));
  let approvedByAdminDocument = false;

  if (firebaseProjectId && firebaseUser?.localId) {
    const adminDocumentResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseProjectId)}/databases/(default)/documents/admins/${encodeURIComponent(firebaseUser.localId)}`,
      { headers: { Authorization: `Bearer ${idToken}` } },
    );
    approvedByAdminDocument = adminDocumentResponse.ok;
  }

  if (
    !firebaseUser ||
    (!approvedByEmail && !hasAdminClaim(firebaseUser.customAttributes) && !approvedByAdminDocument)
  ) {
    response.status(403).json({ error: 'This Google account is not an approved BIO LAB admin.' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = parseBody(request.body);
  } catch {
    response.status(400).json({ error: 'Invalid request body.' });
    return;
  }

  const logicalFolder = typeof body.folder === 'string' ? body.folder.trim() : '';
  if (!/^[a-z0-9/_-]{1,120}$/i.test(logicalFolder)) {
    response.status(400).json({ error: 'Invalid upload section.' });
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'biolab';
  const context = `bio_lab_section=${logicalFolder}`;
  const paramsToSign = `context=${context}&folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1')
    .update(`${paramsToSign}${apiSecret}`)
    .digest('hex');

  response.status(200).json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    apiKey,
    timestamp,
    signature,
    folder,
    context,
  });
}
