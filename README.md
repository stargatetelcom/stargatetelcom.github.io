# Stargate Telcom — public site

Static HTML, CSS, and JS. Palette is deep ocean (`#0A2540`), black, and
white. The mark is in `assets/`. Offerings: **Home**, **Roam**, **Boost**,
**Marketplace**.

## Local preview

```bash
python3 -m http.server 8088
```

http://localhost:8088

## GitHub Pages

Organization site. **Settings → Pages** → deploy **main** from **/** (root).

- Site: https://stargatetelcom.github.io/
- Custom domain: `www.stargatetelcom.com` (see `CNAME`). Do not enter a
  `github.io` name in the custom-domain field.
- DNS: CNAME `www` to `stargatetelcom.github.io`, DNS-only until GitHub
  issues TLS, then Cloudflare SSL **Full**.

Use relative asset paths only.
