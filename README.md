# time-capsule

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Environment Configuration

The frontend reads its backend base URL from the Vite environment variable `VITE_API_BASE`.

Resolution order in `src/services/api.ts`:
1. `import.meta.env.VITE_API_BASE` (from your `.env*` files or hosting provider environment settings)
2. `location.origin` (browser) – so if not set it calls the same host the app is served from
3. Fallback to `http://localhost:3000` (SSR/CI or no window)

### Local development

Create a `.env.development` (or just `.env`) file at the project root:

```env
VITE_API_BASE=http://localhost:3000
```

Restart `npm run dev` after creating/changing env files (Vite only reads them on startup).

### Using a temporary ngrok tunnel

If your backend is exposed via ngrok:
1. Start ngrok for your backend (example: `ngrok http 3000` → gives something like `https://abc123.ngrok.app`).
2. Set that URL in a local `.env` file:
	```env
	VITE_API_BASE=https://abc123.ngrok.app
	```
3. Restart the dev server.

### Production (Netlify)

On Netlify, do NOT commit a real `.env`. Instead set the variable in the Netlify UI:
Site Settings → Build & deploy → Environment → Edit variables → add:

Name: `VITE_API_BASE`
Value: `https://your-production-backend.example.com`

Then redeploy. You can also place it in `netlify.toml` under `[build.environment]` for non-secret values.

### Example file

An `.env.example` file is (or will be) included to show required keys. Copy it to `.env` or `.env.production` / `.env.development` and adjust.

### Multiple environments

You can have:
```
.env                # shared defaults
.env.development    # overrides during dev server
.env.production     # used when building with NODE_ENV=production (npm run build)
```

Vite merges them with priority: specific mode file > base `.env`.

### Verifying at runtime

Open the browser console and run:
```js
import.meta.env.VITE_API_BASE
```
It should print the resolved backend base URL.

If calls still go to localhost, ensure:
- You restarted the dev server after editing env files
- Variable name is exactly `VITE_API_BASE`
- No leading/trailing spaces in the value

---

## Environment Configuration

The frontend reads its backend base URL from the Vite environment variable `VITE_API_BASE`.

Resolution order in `src/services/api.ts`:
1. `import.meta.env.VITE_API_BASE` (from your `.env*` files or hosting provider environment settings)
2. `location.origin` (browser) – so if not set it calls the same host the app is served from
3. Fallback to `http://localhost:3000` (SSR/CI or no window)

### Local development

Create a `.env.development` (or just `.env`) file at the project root:

```env
VITE_API_BASE=http://localhost:3000
```

Restart `npm run dev` after creating/changing env files (Vite only reads them on startup).

### Using a temporary ngrok tunnel

If your backend is exposed via ngrok:
1. Start ngrok for your backend (example: `ngrok http 3000` → gives something like `https://abc123.ngrok.app`).
2. Set that URL in a local `.env` file:
	```env
	VITE_API_BASE=https://abc123.ngrok.app
	```
3. Restart the dev server.

### Production (Netlify)

On Netlify, do NOT commit a real `.env`. Instead set the variable in the Netlify UI:
Site Settings → Build & deploy → Environment → Edit variables → add:

Name: `VITE_API_BASE`
Value: `https://your-production-backend.example.com`

Then redeploy. You can also place it in `netlify.toml` under `[build.environment]` for non-secret values.

### Example file

An `.env.example` file is included to show required keys. Copy it to `.env` or `.env.production` / `.env.development` and adjust.

### Multiple environments

You can have:
```
.env                # shared defaults
.env.development    # overrides during dev server
.env.production     # used when building with NODE_ENV=production (npm run build)
```

Vite merges them with priority: specific mode file > base `.env`.

### Verifying at runtime

Open the browser console and run:
```js
import.meta.env.VITE_API_BASE
```
It should print the resolved backend base URL.

If calls still go to localhost, ensure:
- You restarted the dev server after editing env files
- Variable name is exactly `VITE_API_BASE`
- No leading/trailing spaces in the value

---
