# Stargate Telcom — public site

Static HTML, CSS, and JS. Palette is deep ocean (`#0A2540`), black, and
white. The mark is in `assets/`. Offerings: **Home**, **Roam**, **Boost**,
**Marketplace**.

## Local preview

```bash
python3 -m http.server 8088
```

http://localhost:8088

## Live

Homepage: https://www.stargatetelcom.io/

Published from this repo with GitHub Pages (`main` / root). The `.io` zone
is on Cloudflare, CNAME-hosted to GitHub Pages. DNS, TLS, and the custom
domain are already set.

Fallback: https://stargatetelcom.github.io/

Use relative asset paths only.
