# Production launch checklist

- [ ] Set `NODE_ENV=production`, `APP_URL`, and permitted CORS origin values.
- [ ] Configure `GEMINI_API_KEY`; optionally configure `OPENFDA_API_KEY`.
- [ ] Select, contract with, and validate pricing and pharmacy-inventory providers.
- [ ] Replace in-memory cache/rate limiting with Redis before multiple API replicas.
- [ ] Select a HIPAA-capable authentication and data platform before storing prescription or user data.
- [ ] Add monitoring, alert routing, backups, and a tested recovery runbook.
- [ ] Run dependency, accessibility, browser, mobile-device, and load testing.
- [ ] Obtain legal/privacy review for consumer health data, price claims, and user consent.
- [ ] Confirm TLS termination, CSP, CORS, and secret rotation in the deployment environment.
