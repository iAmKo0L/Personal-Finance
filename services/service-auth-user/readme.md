# service-auth-user

Service phụ trách xác thực và quản lý thông tin người dùng.

## Chạy độc lập
```bash
cd services/service-auth-user
npm install
npm start
```

## Endpoint

### 1) Kiểm tra sức khỏe
- `GET /health`

Phản hồi:
```json
{ "status": "ok" }
```

### 2) Đăng ký
- `POST /auth/register`

Yêu cầu:
```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "password": "12345678"
}
```

Phản hồi 201:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "1",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "createdAt": "2026-04-07T00:00:00.000Z",
    "updatedAt": "2026-04-07T00:00:00.000Z",
    "settings": {
      "userId": "1",
      "defaultCurrency": "USD",
      "monthlySpendingLimit": 0
    }
  }
}
```

### 3) Đăng nhập
- `POST /auth/login`

Yêu cầu:
```json
{
  "email": "a@example.com",
  "password": "12345678"
}
```

Phản hồi 200:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "1",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "createdAt": "2026-04-07T00:00:00.000Z",
    "updatedAt": "2026-04-07T00:00:00.000Z",
    "settings": {
      "userId": "1",
      "defaultCurrency": "USD",
      "monthlySpendingLimit": 0
    }
  }
}
```

### 4) Lấy thông tin người dùng hiện tại
- `GET /users/me`
- Header: `Authorization: Bearer <jwt>`

Phản hồi 200:
```json
{
  "id": "1",
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "createdAt": "2026-04-07T00:00:00.000Z",
  "updatedAt": "2026-04-07T00:00:00.000Z",
  "settings": {
    "userId": "1",
    "defaultCurrency": "USD",
    "monthlySpendingLimit": 0
  }
}
```

### 5) Cập nhật thông tin người dùng
- `PUT /users/me`
- Header: `Authorization: Bearer <jwt>`

Yêu cầu:
```json
{ "fullName": "Nguyen Van B" }
```

Phản hồi 200: cùng cấu trúc với `/users/me`.

### 6) Cập nhật cài đặt người dùng
- `PUT /users/settings`
- Header: `Authorization: Bearer <jwt>`

Yêu cầu:
```json
{
  "defaultCurrency": "VND",
  "monthlySpendingLimit": 15000000
}
```

Phản hồi 200: cùng cấu trúc với `/users/me`.

## Định dạng lỗi
```json
{
  "message": "Error message",
  "details": null
}
```

Mã trạng thái hỗ trợ: `400`, `401`, `404`, `500`.
