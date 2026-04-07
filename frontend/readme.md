# Frontend - Quản Lý Tài Chính Cá Nhân

Frontend xây dựng bằng React + Vite, sử dụng API Gateway để giao tiếp với backend.

## Màn hình chính
- `Login` / `Register`: xác thực người dùng và lưu token
- `Dashboard`: tổng thu, tổng chi, số dư, mức dùng ngân sách, cảnh báo, biểu đồ, giao dịch gần đây
- `Transactions`: danh sách + lọc + CRUD giao dịch
- `Budgets`: quản lý ngân sách theo tháng, thanh tiến độ, trạng thái cảnh báo/vượt mức
- `Reports`: tổng hợp theo tháng, phân bổ theo danh mục, dòng tiền, bảng tổng hợp danh mục
- `Profile/Settings`: cập nhật họ tên, đơn vị tiền mặc định, hạn mức chi tiêu tháng

## Cấu trúc thư mục frontend
```text
frontend/
├── .env.example
├── package.json
├── vite.config.js
└── src/
    ├── pages/        # Dashboard, Transactions, Budgets, Reports, Profile, Auth
    ├── components/   # StatCard, ChartCard, TransactionTable, BudgetCard, ...
    ├── layouts/      # AppLayout, Sidebar, Topbar
    ├── hooks/        # Auth context/store
    ├── services/     # API layer (client + authApi + financeApi + reportApi + mock)
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
- `VITE_USE_MOCK_API=false`
  - `true`: dùng mock service (để demo khi backend chưa sẵn sàng)
  - `false`: gọi API thật

## Frontend gọi Gateway như thế nào
- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET/PUT /api/auth/users/*`
- Finance: `GET/POST/PUT/DELETE /api/finance/*`
- Reports: `GET/POST /api/reports/*`
- Tất cả request đều đi qua API layer trong `src/services/`

## Component chính
- Layout: `AppLayout`, `Sidebar`, `Topbar`
- Data display: `StatCard`, `ChartCard`, `AlertBanner`, `EmptyState`, `LoadingSpinner`
- Transactions: `TransactionFilter`, `TransactionTable`, `TransactionForm`
- Budgets: `BudgetCard`, `BudgetForm`, `BudgetProgress`
- Reports: `ReportMonthFilter`, `ReportCategoryTable`

## Mô tả ngắn theo trang
- `Dashboard`: trang tổng quan trực quan nhất, ưu tiên biểu đồ + KPI + cảnh báo
- `Transactions`: tập trung nhập liệu nhanh và quản lý giao dịch hằng ngày
- `Budgets`: theo dõi mức sử dụng ngân sách theo tháng/danh mục
- `Reports`: xem phân tích theo tháng và theo danh mục để demo số liệu
- `Profile`: quản lý thông tin người dùng và cài đặt tài chính để tính toán dashboard
