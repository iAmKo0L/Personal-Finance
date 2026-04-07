# Phân Tích và Thiết Kế - Hệ Thống Quản Lý Tài Chính Cá Nhân

## 1. Mô tả bài toán
Đề tài xây dựng hệ thống quản lý tài chính cá nhân theo kiến trúc microservice. Người dùng cần:
- Quản lý tài khoản và cấu hình chi tiêu cá nhân
- Ghi nhận giao dịch thu/chi theo danh mục
- Đặt ngân sách theo tháng và nhận cảnh báo vượt ngân sách
- Xem báo cáo tổng hợp để theo dõi dòng tiền

## 2. Tác nhân chính
- **End User**: đăng ký, đăng nhập, cập nhật thông tin, quản lý giao dịch/báo cáo.
- **System Admin (mở rộng sau)**: quản lý vận hành, không tham gia luồng nghiệp vụ chính hiện tại.

## 3. Chức năng chính
- Xác thực JWT, quản lý profile và settings người dùng.
- CRUD transaction, category, budget; lọc theo tháng/loại/danh mục.
- Báo cáo monthly summary, category breakdown, cashflow.
- Sinh notification khi chi tiêu đạt ngưỡng cảnh báo hoặc vượt budget.

## 4. Entity chính
- **User**: id, fullName, email, passwordHash, createdAt, updatedAt.
- **UserSettings**: userId, defaultCurrency, monthlySpendingLimit.
- **Transaction**: id, userId, type, amount, categoryId, note, transactionDate, createdAt, updatedAt.
- **Category**: id, userId/systemDefault, name, type.
- **Budget**: id, userId, month, categoryId, limitAmount, alertThreshold, createdAt, updatedAt.
- **Notification**: id, userId, type, title, message, status, metadata, createdAt.

## 5. Use case chính
1. User đăng ký/đăng nhập nhận JWT.
2. User tạo category, transaction, budget cho tháng hiện tại.
3. User xem tổng thu - chi - số dư và phân tích theo danh mục.
4. User chạy check budget alerts để sinh cảnh báo.
5. User xem danh sách notifications trên dashboard.

## 6. Lý do chia thành 3 microservice
- **service-auth-user**: tách riêng authentication/user profile để tăng bảo mật và khả năng tái sử dụng.
- **service-transaction-budget**: service lõi, tập trung nghiệp vụ giao dịch và ngân sách, thuận lợi mở rộng DB độc lập.
- **service-report-notification**: đọc/phân tích dữ liệu và cảnh báo, có thể scale độc lập khi frontend cần nhiều báo cáo.

Cách chia này giúp code rõ ràng, dễ demo và phù hợp mô hình môn học microservice.
