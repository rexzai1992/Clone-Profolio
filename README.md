# Kaynx1 Portfolio

Cinematic personal portfolio for Izzul Fitree, featuring technical product development, AI automation, interactive games and business systems.

## Admin panel

This portfolio is deployed as a static Next export behind a Cloudflare Worker. The public site uses the built-in `SITE_CONFIG` fallback until saved admin content exists in R2.

### Local setup

Copy `.dev.vars.example` to `.dev.vars` and replace the values:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=your-long-random-secret
```

Run locally:

```bash
npm run build
npx wrangler dev --local
```

Open `/admin/login/` and sign in with the configured credentials.

### Docker setup

The Docker container builds the static Next export and runs the Cloudflare Worker locally through Wrangler.

```bash
cp .dev.vars.example .dev.vars
npm run docker:up
```

Open `http://localhost:8787/` or, from another device on the same LAN, `http://YOUR-MAC-IP:8787/`.

Useful commands:

```bash
npm run docker:build
npm run docker:down
```

### Cloudflare secrets

Set production credentials before deploying:

```bash
printf "admin" | npx wrangler secret put ADMIN_USERNAME
printf "your-password" | npx wrangler secret put ADMIN_PASSWORD
printf "your-long-random-secret" | npx wrangler secret put ADMIN_SESSION_SECRET
```

Admin content is saved to R2 object `content/site-config.json` in `profolio-assets`. Uploaded admin images are saved under `admin/uploads/` and served through `/assets/...`.
