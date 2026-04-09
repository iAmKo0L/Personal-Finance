# Frontend - Quản Lý Tài Chính Cá Nhân

Frontend xây dựng bằng React + Vite, sử dụng API Gateway để giao tiếp với backend.

## Màn hình chính
- `Login` / `Register`: xác thực người dùng và lưu token
- `Tổng quan (sau đăng nhập)`: 1 màn hình duy nhất cho use case “ghi nhận giao dịch và xem tác động ngay lập tức”, gồm:
  - form thêm transaction
  - danh sách transaction
  - thống kê tổng quan
  - biểu đồ trực quan
  - cảnh báo ngân sách

## Cấu trúc thư mục frontend
```text
frontend/
├── .env.example
├── package.json
├── vite.config.js
└── src/
    ├── pages/        # Login, Register, FinanceOverviewPage
    ├── components/   # StatCard, ChartCard, TransactionTable, BudgetCard, ...
    ├── layouts/      # AppLayout, Sidebar, Topbar
    ├── hooks/        # Auth context/store
    ├── services/     # API layer (client + authApi + financeApi + reportApi)
    ├── constants/    # theme/colors
    ├── utils/        # format helpers
    └── styles/       # global styles
```

## Cách chạy frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Biến môi trường
- `VITE_API_BASE_URL=http://localhost:8080`
  - Base URL của Gateway

## Frontend gọi Gateway như thế nào
- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- User settings/profile: `GET/PUT /api/users/me`, `PUT /api/users/settings` (gateway cũng hỗ trợ alias `/api/auth/users/*`)
- Finance:
  - `POST /api/finance/transactions`
  - `GET /api/finance/transactions?month=YYYY-MM`
  - `GET /api/finance/transactions/summary?month=YYYY-MM`
  - `GET /api/finance/transactions/chart?month=YYYY-MM`
  - `GET /api/finance/budgets/current?month=YYYY-MM`
  - `GET /api/finance/budgets`
  - `POST /api/finance/budgets`
  - `PUT /api/finance/budgets/:id`
  - `DELETE /api/finance/budgets/:id`
- Reports:
  - `GET /api/reports/notifications/budget-alerts?month=YYYY-MM`
- Tất cả request đều đi qua API layer trong `src/services/`

## Component chính
- Layout: `AppLayout`, `Sidebar`, `Topbar`
- Data display: `StatCard`, `ChartCard`, `AlertBanner`, `EmptyState`, `LoadingSpinner`
- Transactions: `TransactionTable`, `TransactionForm`
- Budgets: `BudgetCard`, `BudgetForm`, `BudgetProgress`

## Ghi chú
- Các page cũ (Dashboard/Transactions/Budgets/Reports/Profile) được thu gọn về 1 page: `FinanceOverviewPage` để demo use case mượt và rõ nghiệp vụ.
