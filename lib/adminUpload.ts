import { auth } from './firebase';
import { hasAdminAccess } from './auth';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dubmtcs5l';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'biolab_unsigned';

export type AdminUploadOptions = {
  folder: string;
  allowedTypes: string[];
  maxSizeMb?: number;
  onProgress?: (progress: number) => void;
};

export type AdminUploadResult = {
  downloadUrl: string;
  cloudinaryPublicId: string;
  cloudinaryResourceType: string;
  bytes: number;
  format?: string;
  originalFilename?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  format?: string;
  original_filename?: string;
  error?: { message?: string };
};

type SignedUploadTicket = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  context: string;
  error?: string;
};

function matchesAllowedType(file: File, allowedTypes: string[]) {
  return allowedTypes.some((type) => (
    type.endsWith('/') ? file.type.startsWith(type) : file.type === type
  ));
}

export async function uploadAdminFile(file: File, options: AdminUploadOptions) {
  const maxSizeMb = options.maxSizeMb ?? 100;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('ফাইল upload করতে আগে Google Login করুন।');
  }

  if (!(await hasAdminAccess(currentUser))) {
    throw new Error('এই Google account-টি BIO LAB Admin হিসেবে অনুমোদিত নয়।');
  }

  if (!matchesAllowedType(file, options.allowedTypes)) {
    throw new Error('এই ধরনের ফাইল upload করা যাবে না। PDF, image, video, audio, document বা ZIP দিন।');
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`ফাইলটি অনেক বড়। সর্বোচ্চ ${maxSizeMb} MB upload করা যাবে।`);
  }

  const formData = new FormData();
  let uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  if (import.meta.env.DEV) {
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('context', `bio_lab_section=${options.folder}`);
  } else {
    const idToken = await currentUser.getIdToken();
    const ticketResponse = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder: options.folder }),
    });
    const ticket = await ticketResponse.json() as SignedUploadTicket;

    if (!ticketResponse.ok) {
      throw new Error(ticket.error || 'Secure upload permission পাওয়া যায়নি।');
    }

    uploadUrl = ticket.uploadUrl;
    formData.append('api_key', ticket.apiKey);
    formData.append('timestamp', String(ticket.timestamp));
    formData.append('signature', ticket.signature);
    formData.append('folder', ticket.folder);
    formData.append('context', ticket.context);
  }

  formData.append('file', file);

  return new Promise<AdminUploadResult>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', uploadUrl);

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener('error', () => {
      reject(new Error('Cloudinary-এর সাথে সংযোগ করা যায়নি। Internet connection দেখে আবার চেষ্টা করুন।'));
    });

    request.addEventListener('load', () => {
      let response: CloudinaryUploadResponse = {};
      try {
        response = JSON.parse(request.responseText) as CloudinaryUploadResponse;
      } catch {
        // The status-based message below is clearer than a JSON parsing error.
      }

      if (request.status >= 200 && request.status < 300 && response.secure_url && response.public_id) {
        options.onProgress?.(100);
        resolve({
          downloadUrl: response.secure_url,
          cloudinaryPublicId: response.public_id,
          cloudinaryResourceType: response.resource_type || 'raw',
          bytes: response.bytes ?? file.size,
          format: response.format,
          originalFilename: response.original_filename,
        });
        return;
      }

      const cloudinaryMessage = response.error?.message;
      reject(new Error(cloudinaryMessage
        ? `Cloudinary upload failed: ${cloudinaryMessage}`
        : `Cloudinary upload failed (HTTP ${request.status || 'network error'}).`));
    });

    request.send(formData);
  });
}

export const EDUCATIONAL_FILE_TYPES = [
  'application/pdf',
  'image/',
  'video/',
  'audio/',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
];
