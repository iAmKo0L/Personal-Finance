# service-transaction-budget

## Tổng quan

Service này quản lý giao dịch, danh mục và ngân sách cho tài chính cá nhân.

- Lĩnh vực kinh doanh: Quản lý tài chính cá nhân
- Dữ liệu sở hữu: Giao dịch, danh mục, ngân sách
- Hoạt động: Các hoạt động CRUD trên giao dịch, danh mục và ngân sách; tóm tắt và phân tích

## Ngăn xếp công nghệ

| Thành phần | Lựa chọn          |
|------------|-------------------|
| Ngôn ngữ   | Node.js           |
| Khung      | Express           |
| Cơ sở dữ liệu | MySQL             |

## Điểm cuối API

| Phương thức | Điểm cuối                 | Mô tả                   |
|-------------|---------------------------|-------------------------|
| GET         | /health                   | Kiểm tra sức khỏe       |
| GET         | /categories               | Liệt kê danh mục        |
| POST        | /categories               | Tạo danh mục            |
| GET         | /transactions             | Liệt kê giao dịch       |
| POST        | /transactions             | Tạo giao dịch           |
| GET         | /transactions/:id         | Lấy giao dịch theo ID   |
| PUT         | /transactions/:id         | Cập nhật giao dịch      |
| DELETE      | /transactions/:id         | Xóa giao dịch           |
| GET         | /transactions/summary     | Tóm tắt hàng tháng      |
| GET         | /transactions/chart       | Dữ liệu biểu đồ         |
| GET         | /budgets                  | Liệt kê ngân sách       |
| POST        | /budgets                  | Tạo ngân sách           |
| GET         | /budgets/current          | Trạng thái ngân sách hiện tại |
| PUT         | /budgets/:id              | Cập nhật ngân sách      |
| DELETE      | /budgets/:id              | Xóa ngân sách           |
| GET         | /internal/summary         | Tóm tắt nội bộ cho báo cáo |
| GET         | /internal/category-breakdown | Phân tích danh mục     |
| GET         | /internal/analytics/monthly | Phân tích hàng tháng   |
| GET         | /internal/alerts          | Cảnh báo ngân sách      |

> Thông số API đầy đủ: [`docs/api-specs/transaction-budget.yaml`](../../docs/api-specs/transaction-budget.yaml)

## Chạy cục bộ

```bash
# Từ thư mục gốc dự án
docker compose up service-transaction-budget --build

# Hoặc chạy độc lập
cd services/service-transaction-budget
npm install
npm start
```

## Cấu trúc dự án

```
service-transaction-budget/
├── Dockerfile
├── package.json
├── readme.md
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    ├── controllers/
    ├── db/
    ├── middleware/
    ├── models/
    ├── repositories/
    ├── routes/
    ├── services/
    ├── utils/
    └── validations/
```

## Biến môi trường

| Biến         | Mô tả               | Mặc định             |
|--------------|---------------------|----------------------|
| PORT         | Cổng dịch vụ        | 5000                 |
| JWT_SECRET   | Khóa bí mật JWT     | dev-secret-change-me |
| DB_HOST      | Tên máy chủ cơ sở dữ liệu | localhost        |
| DB_PORT      | Cổng cơ sở dữ liệu  | 3306                 |
| DB_USER      | Người dùng cơ sở dữ liệu | finance_user     |
| DB_PASSWORD  | Mật khẩu cơ sở dữ liệu | (trống)            |
| DB_NAME      | Tên cơ sở dữ liệu   | finance_db           |

## Kiểm thử

Chưa cấu hình kiểm thử.

```bash
# npm test (khi được thêm)
```
