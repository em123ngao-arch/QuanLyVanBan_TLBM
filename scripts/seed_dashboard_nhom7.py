#!/usr/bin/env python3
"""
Seed Data Script cho Phân hệ Dashboard (Nhóm 1 - Châu Tuấn Kiệt)
Tác giả / Nhóm phụ trách: Nhóm 7 (Quản trị hệ thống & Đặt phòng họp)
Yêu cầu tích hợp: Theo biên bản điều phối của Nhóm trưởng Nguyễn Viết Tân.

Dữ liệu được tạo:
1. Danh mục & Lịch phòng họp hôm nay:
   - 'Phòng họp A1' (Tầng 1): Trạng thái Đang họp (có cuộc họp CONFIRMED đang diễn ra).
   - 'Phòng trực tuyến B2' (Tầng 2): Trạng thái Sắp diễn ra (cuộc họp bắt đầu sau 1h).
   - 'Phòng Hội trường A' (Tầng 1): Trạng thái Sẵn sàng (không có lịch họp).
2. Dữ liệu nhân viên có sinh nhật:
   - 2 nhân viên sinh nhật Hôm nay (Trùng ngày/tháng hiện tại).
   - 1 nhân viên sinh nhật Ngày mai (Trùng ngày/tháng ngày mai).
   Đầy đủ họ tên, chức vụ, phòng ban để Dashboard hiển thị widget chuẩn xác.

Đặc tính:
- Tính ngày động theo `timezone.localdate()` (không bị hết hạn sau 24h).
- Idempotent: Chạy nhiều lần không trùng lặp bản ghi, không lỗi khóa duy nhất.
"""

import os
import sys
from datetime import date, datetime, time, timedelta
from pathlib import Path

# Đảm bảo import được backend và các app
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))
sys.path.insert(0, str(REPO_ROOT / "backend" / "apps"))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.db import transaction
from django.utils import timezone
from accounts.models import Employee, Position
from organizations.models import DonVi, KhoiKhuVuc
from meetings.models import MeetingRoom, MeetingBooking
from meetings.selectors import lich_hop_dashboard_hom_nay, trang_thai_phong_hop_hom_nay


def ensure_reference_data():
    """Đảm bảo các danh mục Chức vụ và Đơn vị cần thiết đã sẵn sàng."""
    khoi, _ = KhoiKhuVuc.objects.get_or_create(ten="KHỐI HỖ TRỢ", defaults={"stt_uu_tien": 7})
    
    donvi_specs = [
        ("Ban công nghệ thông tin", 53),
        ("Ban hành chính quản trị", 50),
        ("Ban tài chính kế hoạch", 57),
    ]
    donvis = {}
    for ten, stt in donvi_specs:
        dv, _ = DonVi.objects.get_or_create(
            ten=ten,
            defaults={"khoi": khoi, "stt_uu_tien": stt}
        )
        donvis[ten] = dv

    position_specs = [
        ("Trưởng phòng", 2),
        ("Phó phòng", 3),
        ("Chuyên viên", 4),
    ]
    positions = {}
    for name, order in position_specs:
        pos = Position.objects.filter(name=name).first()
        if not pos:
            pos = Position.objects.create(
                name=name,
                display_order=Position.get_next_display_order(),
                is_public=True,
            )
        positions[name] = pos

    return donvis, positions


def seed_meeting_rooms():
    """Tạo / cập nhật 3 phòng họp mẫu theo yêu cầu của Nhóm trưởng Tân."""
    room_specs = [
        {
            "name": "Phòng họp A1",
            "location": "Tầng 1 - Khu Hành chính",
            "capacity": 20,
            "amenities": "Máy chiếu 4K, Âm thanh hội nghị, Bảng tương tác, Điều hòa",
            "is_public": True,
            "trang_thai": MeetingRoom.Status.AVAILABLE,
            "ghi_chu": "Phòng họp tiêu chuẩn giao ban lãnh đạo",
        },
        {
            "name": "Phòng trực tuyến B2",
            "location": "Tầng 2 - Khu Kỹ thuật",
            "capacity": 15,
            "amenities": "Polycom truyền hình số, Camera 360, Mic đa hướng, TV 75 inch",
            "is_public": True,
            "trang_thai": MeetingRoom.Status.AVAILABLE,
            "ghi_chu": "Phòng chuyên dụng họp trực tuyến đa điểm",
        },
        {
            "name": "Phòng Hội trường A",
            "location": "Tầng 1 - Trung tâm hội nghị",
            "capacity": 100,
            "amenities": "Sân khấu lớn, Âm thanh vòm, 2 màn chiếu 300 inch, Bục phát biểu, Livestream",
            "is_public": True,
            "trang_thai": MeetingRoom.Status.AVAILABLE,
            "ghi_chu": "Hội trường tổ chức đại hội, tổng kết và sự kiện lớn",
        },
    ]

    rooms = {}
    for spec in room_specs:
        name = spec.pop("name")
        room, created = MeetingRoom.objects.update_or_create(
            name=name,
            defaults=spec,
        )
        rooms[name] = room
        action = "Tạo mới" if created else "Cập nhật"
        print(f"  [OK] {action} phòng họp: {room.name} ({room.location}, {room.capacity} chỗ)")

    return rooms


def seed_employees_with_birthdays(donvis, positions, today, tomorrow):
    """
    Tạo / cập nhật 3 nhân viên với ngày sinh động:
    - 2 nhân viên sinh nhật Hôm nay
    - 1 nhân viên sinh nhật Ngày mai
    """
    employee_specs = [
        {
            "username": "nguyen_van_an",
            "ho_ten": "Nguyễn Văn An",
            "ngay_sinh": date(1993, today.month, today.day),
            "chuc_vu": positions["Chuyên viên"],
            "don_vi": donvis["Ban công nghệ thông tin"],
            "email": "nguyen_van_an@baolong.vn",
            "sdt": "0908111222",
            "label": "Hôm nay",
        },
        {
            "username": "tran_thi_mai",
            "ho_ten": "Trần Thị Mai",
            "ngay_sinh": date(1988, today.month, today.day),
            "chuc_vu": positions["Trưởng phòng"],
            "don_vi": donvis["Ban hành chính quản trị"],
            "email": "tran_thi_mai@baolong.vn",
            "sdt": "0908333444",
            "label": "Hôm nay",
        },
        {
            "username": "le_hoang_nam",
            "ho_ten": "Lê Hoàng Nam",
            "ngay_sinh": date(1995, tomorrow.month, tomorrow.day),
            "chuc_vu": positions["Phó phòng"],
            "don_vi": donvis["Ban tài chính kế hoạch"],
            "email": "le_hoang_nam@baolong.vn",
            "sdt": "0908555666",
            "label": "Ngày mai",
        },
    ]

    employees = {}
    for spec in employee_specs:
        username = spec["username"]
        emp = Employee.objects.filter(username=username).first()
        if not emp:
            emp = Employee(username=username)
            emp.set_password("Long@2026")
        
        emp.ho_ten = spec["ho_ten"]
        emp.ngay_sinh = spec["ngay_sinh"]
        emp.chuc_vu = spec["chuc_vu"]
        emp.don_vi = spec["don_vi"]
        emp.email = spec["email"]
        emp.sdt = spec["sdt"]
        emp.is_active = True
        emp.trang_thai = Employee.Status.LAM_VIEC
        emp.save()

        employees[username] = emp
        print(f"  [OK] Cán bộ: {emp.ho_ten} ({spec['chuc_vu'].name} - {spec['don_vi'].ten}) | Sinh nhật: {emp.ngay_sinh.strftime('%d/%m/%Y')} [{spec['label']}]")

    return employees


def seed_today_meeting_bookings(rooms, employees, donvis, today, now_dt):
    """
    Tạo lịch họp hôm nay để đạt đủ 3 trạng thái phòng:
    1. 'Phòng họp A1' -> ĐANG HỌP (Khung giờ bao trùm thời điểm hiện tại).
    2. 'Phòng trực tuyến B2' -> SẮP DIỄN RA (Khung giờ bắt đầu sau hiện tại).
    3. 'Phòng Hội trường A' -> SẴN SÀNG (Không có lịch đặt hôm nay).
    """
    current_hour = now_dt.hour
    
    # Tính toán khung giờ bao trùm giờ hiện tại cho Phòng A1
    if 8 <= current_hour <= 16:
        start_in_progress = (now_dt - timedelta(minutes=30)).time().replace(second=0, microsecond=0)
        end_in_progress = (now_dt + timedelta(minutes=60)).time().replace(second=0, microsecond=0)
    else:
        start_in_progress = time(9, 0)
        end_in_progress = time(11, 0)

    # Tính toán khung giờ sắp tới cho Phòng B2
    if 8 <= current_hour <= 15:
        start_upcoming = (now_dt + timedelta(minutes=90)).time().replace(second=0, microsecond=0)
        end_upcoming = (now_dt + timedelta(minutes=180)).time().replace(second=0, microsecond=0)
    else:
        start_upcoming = time(14, 0)
        end_upcoming = time(16, 0)

    booking_specs = [
        {
            "room": rooms["Phòng họp A1"],
            "title": "Họp giao ban Lãnh đạo các Ban chuyên môn",
            "start_time": start_in_progress,
            "end_time": end_in_progress,
            "organizer": employees["tran_thi_mai"],
            "department": donvis["Ban hành chính quản trị"],
            "attendees_count": 12,
            "purpose": "Đánh giá tiến độ triển khai dự án quý và nhiệm vụ trọng tâm tuần.",
            "target_status": "Đang họp",
        },
        {
            "room": rooms["Phòng trực tuyến B2"],
            "title": "Hội nghị trực tuyến thẩm định hồ sơ kỹ thuật số",
            "start_time": start_upcoming,
            "end_time": end_upcoming,
            "organizer": employees["nguyen_van_an"],
            "department": donvis["Ban công nghệ thông tin"],
            "attendees_count": 8,
            "purpose": "Thống nhất kiến trúc tích hợp hệ thống số hóa văn bản và hồ sơ.",
            "target_status": "Sắp diễn ra",
        },
    ]

    # Xóa các booking cũ của 3 phòng này trong ngày để tránh xung đột khung giờ (excl_room_time)
    MeetingBooking.objects.filter(
        date=today,
        room__in=[rooms["Phòng họp A1"], rooms["Phòng trực tuyến B2"], rooms["Phòng Hội trường A"]],
    ).delete()

    created_bookings = []
    for spec in booking_specs:
        target_status = spec.pop("target_status")
        booking = MeetingBooking.objects.create(
            date=today,
            trang_thai=MeetingBooking.Status.CONFIRMED,
            **spec,
        )
        created_bookings.append(booking)
        print(f"  [OK] Đặt phòng: {booking.room.name} | {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')} | '{booking.title}' -> [{target_status}]")

    print(f"  [OK] Phòng '{rooms['Phòng Hội trường A'].name}' không có lịch họp hôm nay -> [Sẵn sàng]")
    return created_bookings


def main():
    print("================================================================================")
    print(" SEED DATA NHÓM 7 -> HỖ TRỢ PHÂN HỆ DASHBOARD / TRANG CHỦ (NHÓM 1)")
    print("================================================================================")

    today = timezone.localdate()
    tomorrow = today + timedelta(days=1)
    now_dt = timezone.localtime()

    print(f"Ngày hiện tại hệ thống: {today.strftime('%d/%m/%Y')} | Giờ: {now_dt.strftime('%H:%M:%S')}")
    print("--------------------------------------------------------------------------------")

    with transaction.atomic():
        print("1. Kiểm tra / khởi tạo danh mục Đơn vị và Chức vụ...")
        donvis, positions = ensure_reference_data()

        print("\n2. Khởi tạo danh mục Phòng họp (3 phòng họp chuẩn hóa)...")
        rooms = seed_meeting_rooms()

        print("\n3. Khởi tạo danh sách Cán bộ có sinh nhật Hôm nay & Ngày mai...")
        employees = seed_employees_with_birthdays(donvis, positions, today, tomorrow)

        print("\n4. Khởi tạo lịch họp hôm nay (Đang họp / Sắp diễn ra / Sẵn sàng)...")
        seed_today_meeting_bookings(rooms, employees, donvis, today, now_dt)

    print("\n--------------------------------------------------------------------------------")
    print(" KIỂM THỬ DỮ LIỆU QUA SELECTORS CỦA MODULE MEETINGS:")
    print("--------------------------------------------------------------------------------")
    
    room_statuses = trang_thai_phong_hop_hom_nay(today, now_dt.time())
    print("\n[Trạng thái phòng họp hôm nay]")
    for r in room_statuses:
        if r["room_name"] in ("Phòng họp A1", "Phòng trực tuyến B2", "Phòng Hội trường A"):
            print(f"  - {r['room_name']}: {r['status_label']} ({r['location']}, {r['capacity']} chỗ)")

    dashboard_meetings = lich_hop_dashboard_hom_nay(today, now_dt.time())
    print(f"\n[Danh sách cuộc họp gửi sang Dashboard Nhóm 1] (Tổng số: {len(dashboard_meetings)} cuộc họp)")
    for m in dashboard_meetings:
        print(f"  - [{m['time']}] {m['room_name']}: {m['meeting_title']} | Chủ trì: {m['organizer']} | Trạng thái: {m['status']}")

    print("\n==> Hoàn tất nạp seed data thành công 100%!")


if __name__ == "__main__":
    main()
