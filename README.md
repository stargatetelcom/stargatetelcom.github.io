# Stargate Telcom — public site

Static HTML, CSS, and JS for GitHub Pages. Palette is deep ocean (`#0A2540`),
black, and white, with a glossy pearl surface. The mark is the blue whale
icon in `assets/`.

Offerings named on the site: **Home**, **Roam**, **Boost**, **Marketplace**.

## Local preview

From this repo:

```bash
python3 -m http.server 8088
```

Then visit `http://localhost:8088`. Relative asset paths work the same way
on GitHub Pages (project site or custom domain).

## GitHub Pages

1. Repo **Settings → Pages** → source **GitHub Actions**.
2. The workflow `.github/workflows/pages.yml` publishes the repo root on
   every push to `main`.
3. First successful run publishes to
   `https://stargatetelcom.github.io/stargatetelcom-homepage/`.

Do not use root-absolute URLs (`/css/styles.css`). They break on a project
Pages URL. This site uses relative paths only.

## Cloudflare (custom domain)

1. CNAME `www` (and apex if you flatten) to `stargatetelcom.github.io`,
   **DNS only** until GitHub verifies the domain.
2. This repo includes `CNAME` with `www.stargatetelcom.com`. Set the same
   custom domain in Pages settings.
3. SSL/TLS **Full** after GitHub HTTPS is live.
