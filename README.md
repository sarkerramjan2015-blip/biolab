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

## Firebase Security Notes

- Timed exam starts require Google login in the client; the rest of the student site stays public.
- Admin pages require the email to be listed in `VITE_ADMIN_EMAILS`.
- Firestore and Storage writes are locked to Firebase custom claim `admin == true`.
- Exam attempts are owner-readable, while MCQ/practical writes stay admin-only.
- Before production, set custom claims for the real admin account and deploy both `firestore.rules` and `storage.rules`.

## Production SEO Checklist

- Replace deployment URL in hosting config and generated sitemap if added.
- Add a real Open Graph image in `public/`.
- Submit the domain to Google Search Console.
- Keep public pages crawlable and avoid putting indexable marketing content behind login.
