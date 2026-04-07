# service-transaction-budget

Service quản lý giao dịch, danh mục và ngân sách.

## Chạy độc lập
```bash
cd services/service-transaction-budget
npm install
npm start
```

## Xác thực
Tất cả endpoint (trừ `/health`) cần header:
`Authorization: Bearer <jwt>`

## Ví dụ API

### Health check
- `GET /health`
Phản hồi:
```json
{ "status": "ok" }
```

### Tạo danh mục
- `POST /categories`
Yêu cầu:
```json
{ "name": "Freelance", "type": "income" }
```
Phản hồi 201:
```json
{ "id": "6", "userId": "1", "systemDefault": false, "name": "Freelance", "type": "income" }
```

### Danh sách danh mục
- `GET /categories`
Phản hồi 200: mảng categories (gồm danh mục mặc định + danh mục do user tạo).

### Tạo giao dịch
- `POST /transactions`
Yêu cầu:
```json
{
  "type": "expense",
  "amount": 120000,
  "categoryId": "3",
  "note": "Lunch",
  "transactionDate": "2025-09-05T09:00:00.000Z"
}
```
Phản hồi 201: đối tượng transaction.

### Lấy danh sách giao dịch có lọc
- `GET /transactions?month=2025-09&type=expense&categoryId=3`
Phản hồi 200:
```json
{
  "filters": { "month": "2025-09", "type": "expense", "categoryId": "3" },
  "totals": { "totalIncome": 0, "totalExpense": 120000, "balance": -120000 },
  "data": []
}
```

### Lấy giao dịch theo id
- `GET /transactions/:id`
Phản hồi 200:
```json
{
  "id": "1",
  "userId": "1",
  "type": "expense",
  "amount": 120000,
  "categoryId": "3",
  "note": "Lunch",
  "transactionDate": "2025-09-05T09:00:00.000Z",
  "createdAt": "2025-09-05T09:00:01.000Z",
  "updatedAt": "2025-09-05T09:00:01.000Z"
}
```

### Cập nhật giao dịch
- `PUT /transactions/:id`
Yêu cầu:
```json
{
  "type": "expense",
  "amount": 150000,
  "categoryId": "3",
  "note": "Lunch and coffee",
  "transactionDate": "2025-09-05T09:00:00.000Z"
}
```
Phản hồi 200: đối tượng transaction sau cập nhật.

### Xóa giao dịch
- `DELETE /transactions/:id`
Phản hồi 204: không có nội dung.

### Tạo ngân sách
- `POST /budgets`
Yêu cầu:
```json
{
  "month": "2025-09",
  "categoryId": null,
  "limitAmount": 10000000,
  "alertThreshold": 80
}
```

### Lấy danh sách ngân sách
- `GET /budgets`
Phản hồi 200: mảng ngân sách.

### Lấy ngân sách theo tháng hiện tại
- `GET /budgets/current?month=2025-09`

### Cập nhật ngân sách
- `PUT /budgets/:id`
Yêu cầu:
```json
{
  "month": "2025-09",
  "categoryId": null,
  "limitAmount": 12000000,
  "alertThreshold": 85
}
```
Phản hồi 200: đối tượng budget sau cập nhật.

### Endpoint nội bộ: summary cho report service
- `GET /internal/summary?month=2025-09`

### Endpoint nội bộ: category breakdown cho report service
- `GET /internal/category-breakdown?month=2025-09`
Phản hồi 200:
```json
{
  "month": "2025-09",
  "data": [
    {
      "categoryId": "3",
      "categoryName": "Food",
      "type": "expense",
      "income": 0,
      "expense": 120000
    }
  ]
}
```

### Endpoint tương thích: analytics nội bộ
- `GET /internal/analytics/monthly?month=2025-09`
Phản hồi 200:
```json
{
  "month": "2025-09",
  "summary": { "month": "2025-09", "totalIncome": 0, "totalExpense": 120000, "balance": -120000 },
  "categories": [
    { "categoryId": "3", "categoryName": "Food", "type": "expense", "income": 0, "expense": 120000 }
  ]
}
```

### Endpoint tương thích: cảnh báo nội bộ
- `GET /internal/alerts?month=2025-09`
Phản hồi 200:
```json
[
  {
    "budgetId": "1",
    "month": "2025-09",
    "categoryId": null,
    "limitAmount": 10000000,
    "alertThreshold": 80,
    "spentAmount": 120000,
    "spentRatio": 1.2,
    "status": "safe"
  }
]
```

## Định dạng lỗi
```json
{
  "message": "Error message",
  "details": null
}
```
