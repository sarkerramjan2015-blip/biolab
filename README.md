# BIO LAB

BIO LAB is a React + Vite biology learning platform for SSC/HSC students. It includes a landing page, student dashboard, resource hub, PDF reader, solve class page, mentor profile, practical library, timed MCQ exams, and admin content tools.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`:
   ```bash
   VITE_APP_URL="http://localhost:3000"
   VITE_ADMIN_EMAILS="your-admin-email@example.com"
   VITE_ALLOW_LOCAL_ADMIN_PREVIEW="false"
   VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   VITE_CLOUDINARY_UPLOAD_PRESET="your-local-unsigned-preset"
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Checks

```bash
npm run typecheck
npm run build
```

## Firebase and Upload Security Notes

- Timed exam starts require Google login in the client; the rest of the student site stays public.
- Admin pages accept approved email, Firebase custom claim `admin == true`, or a provisioned `admins/{uid}` document.
- Firestore writes independently enforce approved emails/custom claims/admin documents.
- Exam attempts are owner-readable, while MCQ/practical writes stay admin-only.
- Local admin files can use a restricted unsigned preset. Production uploads use `/api/cloudinary-signature` and require a verified approved-admin Firebase ID token.
- Configure `ADMIN_EMAILS`, `FIREBASE_WEB_API_KEY`, `FIREBASE_PROJECT_ID`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` as server-only Vercel variables.
- Before production, set custom claims for the real admin account, deploy `firestore.rules`, and keep the Cloudinary API secret server-only.

## Production SEO Checklist

- Replace deployment URL in hosting config and generated sitemap if added.
- Add a real Open Graph image in `public/`.
- Submit the domain to Google Search Console.
- Keep public pages crawlable and avoid putting indexable marketing content behind login.
