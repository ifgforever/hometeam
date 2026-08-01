This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Cloudflare Workers

This app is configured for Cloudflare Workers through OpenNext and uses the
`hometeam-db` D1 database.

1. Copy `.dev.vars.example` to `.dev.vars` and supply local values.
2. Run `npm run db:migrate:local` and `npm run preview` for a Workers-runtime preview.
3. Add `JWT_SECRET`, `SMTP_USER`, and `SMTP_PASS` as Worker secrets. Set
   `SMTP_HOST`, `SMTP_PORT`, and `NEXT_PUBLIC_APP_URL` as Worker variables.
4. Run `npm run db:migrate:remote`, then `npm run deploy`.

Quick Assign email notifications require the SMTP settings above. Gmail users
should use an app password rather than an account password.
