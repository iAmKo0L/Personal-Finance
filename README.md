# Quản Lý Tài Chính Cá Nhân - Đồ Án Microservices

Hệ thống quản lý tài chính cá nhân được xây dựng theo kiến trúc microservice.  
Mục tiêu: quản lý người dùng, giao dịch - ngân sách, báo cáo - cảnh báo để demo đồ án môn học.

## Thành viên nhóm
| Họ tên | MSSV | Vai trò |
|---|---|---|
| Đỗ Đức Cảnh | B22DCCN086 | Service transaction budget / Gateway |
| Trần Quang Huy | B22DCCN397 | Service report notification / Frontend |
| Trần Quang Huy | B22DCCN398 | Service auth user / Frontend |

## Cấu trúc thư mục
```text
gateway/                         # API Gateway
services/
  service-auth-user/             # Xác thực + hồ sơ/cài đặt người dùng
  service-transaction-budget/    # Giao dịch, danh mục, ngân sách
  service-report-notification/   # Báo cáo + thông báo
frontend/                        # Giao diện người dùng
docs/                            # Phân tích thiết kế, kiến trúc, OpenAPI
docker-compose.yml
```

## Danh sách service
- `mysql` (host thường forward `3306` -> `3306` trong container; đổi bằng `MYSQL_PUBLISH_PORT` trong `.env`)
- `gateway` (port host mặc định: `8080`)
- `service-auth-user` (host: `15001`, container: `5000`)
- `service-transaction-budget` (host: `15002`, container: `5000`)
- `service-report-notification` (host: `15003`, container: `5000`)
- `frontend` (host: `3000`)

## Endpoint chính (qua Gateway)
- Auth/User:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Finance:
  - `GET/POST /api/finance/transactions`
  - `GET /api/finance/categories`
  - `GET/POST /api/finance/budgets`
- Reports/Notifications:
  - `GET /api/reports/monthly-summary?month=YYYY-MM`
  - `GET /api/reports/category-breakdown?month=YYYY-MM`
  - `GET /api/reports/cashflow?month=YYYY-MM`
  - `GET /api/reports/alerts`
  - `POST /api/reports/check-budget-alerts?month=YYYY-MM`

## Hướng dẫn chạy chi tiết

### 1) Yêu cầu môi trường
- Cài `Docker Desktop` (Windows/macOS) hoặc `Docker Engine + Docker Compose` (Linux)
- Docker daemon đang chạy trước khi chạy lệnh

Kiểm tra nhanh:
```bash
docker --version
docker compose version
```

### 2) Tạo file cấu hình `.env`
Copy file mẫu:
```bash
cp .env.example .env
```

Nếu dùng PowerShell:
```powershell
Copy-Item .env.example .env
```

Giá trị quan trọng trong `.env`:
- Port host:
  - `FRONTEND_PORT=3000`
  - `GATEWAY_PORT=8080`
  - `SERVICE_AUTH_USER_PORT=15001`
  - `SERVICE_TRANSACTION_BUDGET_PORT=15002`
  - `SERVICE_REPORT_NOTIFICATION_PORT=15003`
- MySQL:
  - `MYSQL_APP_USER=finance_user`
  - `MYSQL_APP_PASSWORD=finance_password`
  - `MYSQL_ROOT_PASSWORD=root_password`
  - `MYSQL_PUBLISH_PORT=3306`
- JWT:
  - `JWT_SECRET=your-jwt-secret`
  - `JWT_EXPIRES_IN=1d`

> Lưu ý: không dùng `DB_USER` trong `.env` root cho Docker Compose.  
> Project dùng `MYSQL_APP_USER` để tránh xung đột biến môi trường hệ thống trên Windows.

### 3) Build và chạy toàn bộ hệ thống
```bash
docker compose up --build
```

Chạy nền (background):
```bash
docker compose up --build -d
```

### 4) Truy cập ứng dụng
- Frontend: `http://localhost:3000`
- API Gateway: `http://localhost:8080`
- Gateway health: `http://localhost:8080/health`

Health check từng backend (nếu cần):
```bash
curl http://localhost:15001/health
curl http://localhost:15002/health
curl http://localhost:15003/health
```

### 5) Đăng ký / đăng nhập
- Mở UI: `http://localhost:3000/register` để tạo tài khoản
- Đăng nhập tại `http://localhost:3000/login`
- Sau khi đăng nhập, vào Dashboard và các trang Transactions/Budgets/Reports/Profile

### 6) Lệnh quản lý thường dùng
Dừng hệ thống:
```bash
docker compose down
```

Xem logs:
```bash
docker compose logs -f
```

Rebuild riêng 1 service:
```bash
docker compose build gateway --no-cache
docker compose up -d gateway
```

### 7) Xử lý lỗi thường gặp
- `port is already allocated`:
  - Đổi port trong `.env` (ví dụ `SERVICE_AUTH_USER_PORT=16001`)
  - Hoặc dừng process/container đang chiếm port
- MySQL lỗi `MYSQL_USER="root"`:
  - Dùng `MYSQL_APP_USER` khác `root`
- Frontend báo `Failed to fetch`:
  - Kiểm tra `gateway` đang chạy (`/health`)
  - Kiểm tra `frontend/.env` (nếu có) đặt `VITE_API_BASE_URL=http://localhost:8080`
- Đã đổi schema/init DB mà vẫn lỗi:
  - Cần reset volume DB (sẽ mất dữ liệu):
    ```bash
    docker compose down -v
    docker compose up --build
    ```

## MySQL (DB thật — đã tích hợp)
- `docker-compose.yml` có service `mysql:8`, volume `mysql-data`, và script khởi tạo `docker/mysql/init.sql`.
- Mỗi backend service dùng `mysql2`, pool kết nối và `ensureSchema()` (CREATE TABLE IF NOT EXISTS) khi khởi động.
- Ba database logic trên cùng một instance:
  - `auth_user_db` — `service-auth-user`
  - `finance_db` — `service-transaction-budget`
  - `report_db` — `service-report-notification` (bảng `notifications`)

### Biến `.env` (copy từ `.env.example`)
```env
FRONTEND_PORT=3000
GATEWAY_PORT=8080
SERVICE_AUTH_USER_PORT=15001
SERVICE_TRANSACTION_BUDGET_PORT=15002
SERVICE_REPORT_NOTIFICATION_PORT=15003

MYSQL_APP_USER=finance_user
MYSQL_APP_PASSWORD=finance_password
MYSQL_ROOT_PASSWORD=root_password
DB_HOST=mysql
DB_PORT=3306
MYSQL_PUBLISH_PORT=3306
AUTH_DB_NAME=auth_user_db
FINANCE_DB_NAME=finance_db
REPORT_DB_NAME=report_db

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
```

**Lưu ý:** Compose dùng `MYSQL_APP_USER` / `MYSQL_APP_PASSWORD` (không dùng tên `DB_USER` trong `.env` root) để tránh bị biến hệ thống `DB_USER=root` trên Windows ghi đè.

### Chạy
```bash
docker compose up --build
```
Dữ liệu được lưu trong volume `mysql-data`; restart container không mất dữ liệu (trừ khi xóa volume).

## Tài liệu
- Phân tích thiết kế: `docs/analysis-and-design.md`
- Kiến trúc hệ thống: `docs/architecture.md`
- Frontend guide: `frontend/readme.md`
- OpenAPI:
  - `docs/api-specs/auth-user.yaml`
  - `docs/api-specs/transaction-budget.yaml`
  - `docs/api-specs/report-notification.yaml`

## Hướng phát triển
- Dùng công cụ migration (Flyway/Liquibase/knex migrate) thay cho `ensureSchema` SQL thuần.
- Bổ sung refresh token, RBAC, rate limiting.
- Thêm event bus (RabbitMQ/Kafka) cho notification async.
- Mở rộng dashboard với so sánh theo tháng, dự báo chi tiêu.
- Bổ sung unit/integration test và CI pipeline.
