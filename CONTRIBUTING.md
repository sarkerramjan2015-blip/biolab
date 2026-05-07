# Contributing

Thanks for helping improve BIO LAB.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run typecheck
npm run build
```

## Code Style

- Keep UI changes consistent with the existing React, Tailwind, and shadcn-style component patterns.
- Keep admin/content write paths protected.
- Do not commit `.env.local`, Firebase service account files, generated builds, or logs.
