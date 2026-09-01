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

- Fallback: https://stargatetelcom.github.io/
- Custom domain: `www.stargatetelcom.com` (see `CNAME`). Do not enter a
  `github.io` name in the custom-domain field.

Cloudflare DNS for `stargatetelcom.com` must be **DNS only** (grey cloud),
not proxied:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `www` | `stargatetelcom.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Use relative asset paths only.
