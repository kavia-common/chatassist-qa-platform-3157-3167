# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- Lightweight and modern UI
- Fast: minimal dependencies
- Simple to understand and modify

## Backend API linkage

This frontend talks to a Django backend via REST endpoints under `/api/*`. To ensure requests go to the backend (and not to the React dev server), set the following environment variable before starting the app:

- REACT_APP_BASE_URL: The full origin of your backend, without a trailing slash.
  - Example (local): REACT_APP_BASE_URL=http://localhost:8000
  - Example (deployed): REACT_APP_BASE_URL=https://your-backend.example.com

Important:
- Do not rely on relative `/api` paths; the app will refuse to start requests if REACT_APP_BASE_URL is not provided, preventing errors like "Cannot POST /api/chat/send/" from the dev server.
- Ensure your backend exposes endpoints like:
  - GET /api/health/
  - POST /api/chat/send/ (alias for POST /api/ask/)
  - GET /api/chat/history/
  - Auth endpoints if enabled.

You can set the variable inline or via a `.env` file.

### .env example

Create `.env` in the qanda_frontend directory with:

```
# Required: Django backend base URL (no trailing slash)
REACT_APP_BASE_URL=http://localhost:8000
```

Then run:

```
npm start
```

or for production:

```
npm run build
```

## Getting Started

In the project directory, you can run:

- npm start — runs the app in development mode at http://localhost:3000
- npm test — launches the test runner
- npm run build — builds the app for production

## Learn More

To learn React, check out the React documentation.
