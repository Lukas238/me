# Workers del sitio

Dos Cloudflare Workers reciben datos de la web y los guardan como archivos en este repo mediante la API de GitHub. Cada commit dispara el rebuild de GitHub Pages.

| Worker | Carpeta | Recibe | Guarda en |
|---|---|---|---|
| `wishlist-sync` | [wishlist-sync](./wishlist-sync) | `POST /` del bookmarklet, con el header `X-Wishlist-Key` | `_data/wishlist/<fecha>-<titulo>-<rand>.json` |
| `comments-inbox` | [comments-worker](./comments-worker) | `POST /` del formulario de comentarios, con el código familiar | `_data/comments/<kind>/<fecha>-<id>-<rand>.json` |

El código común (comparación de claves, limpieza de texto, commits a GitHub) está en [shared/inbox.js](./shared/inbox.js).

La cuenta de Cloudflare está fijada con `account_id` en cada `wrangler.toml`.

## Login de Sveltia CMS

El login de GitHub en `/admin/` usa un tercer Worker, `me-cms-auth`, desplegado desde el [autenticador oficial de Sveltia](https://github.com/sveltia/sveltia-cms-auth). No usa el token ni el KV de los workers de datos.

- URL: https://me-cms-auth.dassolucas.workers.dev
- Callback de GitHub: https://me-cms-auth.dassolucas.workers.dev/callback
- `ALLOWED_DOMAINS`: `me.c238.com.ar` (solo producción).
- Configuración del CMS: [`backend.base_url` en admin/config.yml](../admin/config.yml).
- Revisión desplegada del autenticador: `e62e76ae5ca4dd28e751607b331bb47bb1feddfe`.

### Completar la configuración

1. [Registrar una GitHub App](https://github.com/settings/apps/new?name=Sveltia+CMS+Auth+for+me&url=https%3A%2F%2Fme.c238.com.ar&webhook_active=false&contents=write&pull_requests=write). Usar el callback indicado arriba; dejar la expiración de tokens activada, desactivar webhooks y no activar Device Flow ni la autorización durante la instalación.
2. Dar permisos de repositorio **Contents: Read and write**, **Metadata: Read-only** y **Pull requests: Read and write**. Dejar **Workflows: No access**.
3. Instalar la App en la cuenta `Lukas238`, seleccionando únicamente `Lukas238/me`. Quienes inicien sesión deben tener permiso de escritura en el repositorio.
4. En la App, copiar el **Client ID** (no el App ID) y generar un **Client secret** desde Credentials.
5. En [Cloudflare > me-cms-auth > Settings > Variables and Secrets](https://dash.cloudflare.com/449ed5cb0f3def6bd64f4d0cd3139a63/workers/services/view/me-cms-auth/production/settings), agregar `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`; guardar el segundo como **Secret**. No pegarlo en el chat, el repo ni comandos de terminal.
6. Guardar/desplegar las variables. Revisar y publicar el cambio de `admin/config.yml` mediante el flujo habitual de GitHub Pages; luego abrir https://me.c238.com.ar/admin/ e iniciar sesión con GitHub.

Hasta configurar ambas credenciales, el Worker responde `MISCONFIGURED_CLIENT`: estar desplegado no significa que el login esté listo.

### Actualizar el autenticador

El código se mantiene en el proyecto oficial, no se copia a este repo. Desde un clon de ese proyecto, con Wrangler instalado y autenticado en la cuenta del sitio:

```bash
git clone https://github.com/sveltia/sveltia-cms-auth.git
cd sveltia-cms-auth
git checkout e62e76ae5ca4dd28e751607b331bb47bb1feddfe
npm install
CLOUDFLARE_ACCOUNT_ID=449ed5cb0f3def6bd64f4d0cd3139a63 \
  npx wrangler deploy --name me-cms-auth \
  --var ALLOWED_DOMAINS:me.c238.com.ar --keep-vars --strict
```

Para actualizar, revisar y seleccionar una nueva revisión oficial y actualizar la referencia documentada. `--keep-vars` conserva el Client ID cargado desde el dashboard; los secrets también se conservan.

## Bookmarklet - Add to Wishlist

Agrega productos a `_data/wishlist/` (un archivo por producto) desde cualquier página. Guía de uso: [BOOKMARKLET.md](./BOOKMARKLET.md).

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
