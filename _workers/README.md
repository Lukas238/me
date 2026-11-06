# Workers del sitio

Dos Cloudflare Workers reciben datos de la web y los guardan como archivos en este repo mediante la API de GitHub. Cada commit dispara el rebuild de GitHub Pages.

| Worker | Carpeta | Recibe | Guarda en |
|---|---|---|---|
| `wishlist-sync` | [wishlist-sync](./wishlist-sync) | `POST /` del bookmarklet, con el header `X-Wishlist-Key` | `_data/wishlist.json` (agrega arriba) |
| `comments-inbox` | [comments-worker](./comments-worker) | `POST /` del formulario de comentarios, con el código familiar | `_data/comments/<kind>/<fecha>-<id>-<rand>.json` |

El código común (comparación de claves, limpieza de texto, commits a GitHub) está en [shared/inbox.js](./shared/inbox.js).

La cuenta de Cloudflare está fijada con `account_id` en cada `wrangler.toml`.

## Bookmarklet - Add to Wishlist

Agrega productos a `_data/wishlist.json` desde cualquier página. Guía de uso: [BOOKMARKLET.md](./BOOKMARKLET.md).

**Instalación:** desde la raíz del repo corre `node scripts/build-bookmarklet.js`; toma `WISHLIST_KEY` del `.env` (ignorado por git; si no está, la pide) y pega el resultado (empieza con `javascript:`) como URL de un marcador nuevo. En macOS también queda copiado al portapapeles. El `.env` también guarda como respaldo `FAMILY_CODE` y `GITHUB_TOKEN` (los que usan los workers desde el KV `SITE_CONFIG`); ningún script los lee. La plantilla es `.env.example`. El código fuente es [bookmarklet-source.js](./bookmarklet-source.js).

## Deploy

```bash
cd _workers
npm install
npm run deploy:wishlist   # wishlist-sync
npm run deploy:comments   # comments-inbox
```

La config compartida está en el KV `SITE_CONFIG` de Cloudflare (no en el repo): `github_token` (ambos workers), `wishlist_key` (`wishlist-sync`, la que valida el bookmarklet) y `family_code` (`comments-inbox`). Se cambian sin redeploy (el edge cachea ~60 s):

```bash
cd _workers
export CLOUDFLARE_ACCOUNT_ID=449ed5cb0f3def6bd64f4d0cd3139a63
./node_modules/.bin/wrangler kv key put family_code "<código>" --namespace-id e2e1a06349bc4f30af02ffd7936adf0b --remote
```

También se pueden editar desde el dashboard: Workers & Pages > KV > `SITE_CONFIG`.

### Token de GitHub (`github_token`)

Los workers escriben en el repo con un fine-grained token. Para crearlo: GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token, y configura:

- **Repository access:** Only select repositories > `Lukas238/me`
- **Repository permissions:** Contents > Read and write (Metadata queda en Read-only automáticamente)
- **Expiration:** máximo 1 año; cuando venza, genera uno nuevo y reemplaza el valor en el KV

Copia el token (solo se muestra una vez) y guárdalo como `github_token`: desde el dashboard (KV > `SITE_CONFIG` > Add entry), o con el comando de arriba cambiando `family_code "<código>"` por `github_token "<token>"`. El dashboard evita que el token quede en el historial de la terminal.
