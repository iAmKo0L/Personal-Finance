# Phân Tích và Thiết Kế - Hệ Thống Quản Lý Tài Chính Cá Nhân

## 1. Mô tả bài toán
Đề tài xây dựng hệ thống quản lý tài chính cá nhân theo kiến trúc microservice.

Để tối ưu cho demo và đúng scope đồ án, dự án tập trung vào **một use case chính**:
**“Ghi nhận transaction mới và hiển thị tác động của nó lên danh sách giao dịch, thống kê và ngân sách.”**

Người dùng có thể:
- Đăng ký/đăng nhập (JWT)
- Ghi nhận giao dịch thu/chi theo danh mục
- Xem danh sách giao dịch theo tháng
- Xem thống kê tổng thu/tổng chi/số dư và biểu đồ theo tháng
- Thiết lập ngân sách (tổng hoặc theo danh mục) và xem cảnh báo ngân sách

## 2. Tác nhân chính
- **End User**: đăng ký, đăng nhập, quản lý giao dịch/báo cáo.

## 3. Chức năng chính
- Người dùng đăng nhập hoặc tạo tài khoản mới, xác thực JWT.
- CRUD transaction, category, budget; lọc theo tháng.
- API tổng hợp để frontend cập nhật nhanh ngay sau khi tạo transaction (summary + budget status + alerts).
- Budget alerts (cảnh báo ngân sách) theo tháng, lấy dữ liệu từ finance service.

## 4. Entity chính
- **User**: id, fullName, email, passwordHash, createdAt, updatedAt.
- **UserSettings**: userId, defaultCurrency (mặc định `VND`).
- **Transaction**: id, userId, type, amount, categoryId, note, transactionDate, createdAt, updatedAt.
- **Category**: id, userId/systemDefault, name, type.
- **Budget**: id, userId, month, categoryId, limitAmount, alertThreshold, createdAt, updatedAt.
- **Notification**: id, userId, type, title, message, status, metadata, createdAt.

## 5. Use case chính
1. User đăng ký/đăng nhập nhận JWT.
2. User vào màn hình **Tổng quan** (một trang duy nhất sau login).
3. User tạo transaction (thu/chi).
4. Hệ thống trả về dữ liệu “tác động” để UI cập nhật ngay:
   - Danh sách giao dịch
   - Summary (income/expense/balance)
   - Budget status + budget alerts
5. User có thể quản lý budget (thêm/sửa/xóa) cho tháng đang chọn để xem cảnh báo/biểu đồ thay đổi.

## 6. Lý do chia thành 3 microservice
- **service-auth-user**: tách riêng authentication/user profile để tăng bảo mật và khả năng tái sử dụng.
- **service-transaction-budget**: service lõi, tập trung nghiệp vụ giao dịch và ngân sách, thuận lợi mở rộng DB độc lập.
- **service-report-notification**: đọc/phân tích dữ liệu và cảnh báo, có thể scale độc lập khi frontend cần nhiều báo cáo.

Cách chia này giúp code rõ ràng, dễ demo và phù hợp mô hình môn học microservice.
