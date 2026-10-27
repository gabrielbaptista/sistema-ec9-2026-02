# Angular workspace

The root README describes the full local environment. For native development, start the API on `http://localhost:5080` and run `npm start`; `proxy.conf.json` forwards `/api` requests to it. Docker Compose uses `proxy.compose.conf.json` to reach the API service by its Compose DNS name.

Run `npm run lint`, `npm run build`, `npm test -- --watch=false --browsers=ChromeHeadless`, or `npm run format:check` from this directory.
