# Muhammad Arslan — Portfolio

One-page portfolio built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and [Framer Motion](https://www.framer.com/motion/). Published app tiles fetch preview artwork from App Store / Google Play HTML via `/api/store-preview` (Open Graph and related meta tags).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this repository to GitHub (or GitLab / Bitbucket).
2. Import the repo in the [Vercel dashboard](https://vercel.com/new) and deploy with the default Next.js settings.

Or use the CLI (requires a [Vercel account](https://vercel.com/signup) and login):

```bash
npx vercel
```

For production:

```bash
npx vercel --prod
```

## Data

Copy and store links live in `data/portfolio.ts`. Non-store URLs from the CV (e.g. admin panels or marketing sites) are intentionally omitted from the **Published apps** section.

## License

Private / personal use.
