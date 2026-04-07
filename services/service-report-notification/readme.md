# service-report-notification

Service phụ trách báo cáo dashboard và cảnh báo ngân sách.

## Chạy độc lập
```bash
cd services/service-report-notification
npm install
npm start
```

Tất cả endpoint (trừ `/health`) yêu cầu:
`Authorization: Bearer <jwt>`

## Endpoint

### Health check
- `GET /health`
Phản hồi:
```json
{ "status": "ok" }
```

### Tổng hợp theo tháng
- `GET /reports/monthly-summary?month=2025-09`
Phản hồi:
```json
{
  "month": "2025-09",
  "totalIncome": 3000,
  "totalExpense": 1200,
  "balance": 1800,
  "transactionCount": 3
}
```

### Phân tích theo danh mục
- `GET /reports/category-breakdown?month=2025-09`
Phản hồi:
```json
{
  "month": "2025-09",
  "totalExpense": 1200,
  "categories": [
    { "categoryId": "1", "categoryName": "Food", "amount": 500, "percentage": 41.67 },
    { "categoryId": "2", "categoryName": "Transport", "amount": 700, "percentage": 58.33 }
  ]
}
```

### Dòng tiền (cashflow)
- `GET /reports/cashflow?month=2025-09`
Phản hồi:
```json
{
  "month": "2025-09",
  "granularity": "daily",
  "points": [
    { "date": "2025-09-01", "income": 3000, "expense": 0, "net": 3000 },
    { "date": "2025-09-03", "income": 0, "expense": 500, "net": -500 }
  ]
}
```

### Lấy danh sách thông báo
- `GET /notifications`
Phản hồi:
```json
{ "data": [] }
```

### Kiểm tra cảnh báo ngân sách
- `POST /notifications/check-budget-alerts?month=2025-09`
Phản hồi:
```json
{
  "month": "2025-09",
  "created": 1,
  "data": [
    {
      "id": "temp-abc123",
      "userId": "1",
      "type": "budget_alert",
      "title": "Budget alert",
      "message": "Your spending reached 91.67% (threshold 80%).",
      "status": "warning",
      "metadata": {
        "budgetId": "1",
        "month": "2025-09",
        "spentRatio": 91.67
      },
      "createdAt": "2025-09-05T10:00:00.000Z"
    }
  ]
}
```

## Ghi chú
- Service gọi `service-transaction-budget` qua lớp HTTP client abstraction.
- Đặt `USE_MOCK_ADAPTER=true` để demo khi chưa phụ thuộc service thật.
