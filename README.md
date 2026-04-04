# Irish Payments POS Frontend

Vue 3 + Vite frontend for **Irish Payments POS** (irishpayments-pos monolith).

Cloned from jaldi-puncture-frontend. All API URLs point to the monolith by default.

## Prerequisites

- Node.js 18+
- Irish Payments POS API running (e.g. `php artisan serve --port=8001`)

## Setup

```sh
npm install --legacy-peer-deps
```

## Development

```sh
npm run dev
```

Runs at http://localhost:5173 (or the port Vite shows).

## Build

```sh
npm run build
```

## Environment

Edit `.env` to change the API base URL. Default: `http://127.0.0.1:8001`.
