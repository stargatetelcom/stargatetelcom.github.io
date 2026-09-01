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

- Canonical site: https://www.stargatetelcom.io/
- Fallback: https://stargatetelcom.github.io/
- Custom domain in Pages: `www.stargatetelcom.io` (see `CNAME`).

For the **.io** zone, point GitHub Pages with DNS only if you want GitHub
to verify the domain:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `www` | `stargatetelcom.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Use relative asset paths only.
