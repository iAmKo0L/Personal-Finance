# API Gateway

Gateway là điểm vào duy nhất cho frontend.

## Định tuyến
- `/api/auth/*` -> `service-auth-user`
- `/api/users/*` -> `service-auth-user`
- `/api/finance/*` -> `service-transaction-budget`
- `/api/reports/*` -> `service-report-notification`

## Health check
- `GET /health` -> `{ "status": "ok" }`
