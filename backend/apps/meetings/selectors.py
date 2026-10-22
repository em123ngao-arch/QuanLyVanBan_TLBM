"""
Public selectors cho module Phòng họp (Nhóm 7).
Tuân thủ AGENTS.md: Module sở hữu dữ liệu cung cấp selector công khai
cho Dashboard (Nhóm 1) và các phân hệ khác sử dụng, tránh truy vấn SQL thô
hoặc can thiệp chéo cấu trúc bảng.
"""

from datetime import datetime, time
from django.utils import timezone
from meetings.models import MeetingRoom, MeetingBooking


def trang_thai_phong_hop_hom_nay(ngay=None, thoi_diem=None):
    """
    Xác định trạng thái hoạt động thực tế của từng phòng họp tại một thời điểm trong ngày.
    
    Quy tắc trạng thái:
      - 'Bảo trì' (MAINTENANCE): Phòng họp đang trong chế độ bảo trì kỹ thuật.
      - 'Không khả dụng' (UNAVAILABLE): Phòng họp tạm ngừng sử dụng.
      - 'Đang họp' (IN_PROGRESS): Đang có cuộc họp CONFIRMED trong khung giờ (start_time <= thoi_diem < end_time).
      - 'Sắp diễn ra' (UPCOMING): Có cuộc họp CONFIRMED bắt đầu sau thoi_diem trong ngày.
      - 'Sẵn sàng' (AVAILABLE): Không có cuộc họp nào đang diễn ra hoặc sắp tới trong ngày.
    """
    if ngay is None:
        ngay = timezone.localdate()
    if thoi_diem is None:
        thoi_diem = timezone.localtime().time()

    rooms = MeetingRoom.objects.filter(is_public=True).order_by("name")
    bookings = MeetingBooking.objects.filter(
        date=ngay,
        trang_thai=MeetingBooking.Status.CONFIRMED,
    ).select_related("room", "organizer", "department")

    bookings_by_room = {}
    for b in bookings:
        bookings_by_room.setdefault(b.room_id, []).append(b)

    results = []
    for room in rooms:
        if room.trang_thai == MeetingRoom.Status.MAINTENANCE:
            status_code = "MAINTENANCE"
            status_label = "Bảo trì"
        elif room.trang_thai == MeetingRoom.Status.UNAVAILABLE:
            status_code = "UNAVAILABLE"
            status_label = "Không khả dụng"
        else:
            room_bookings = bookings_by_room.get(room.id, [])
            in_progress = any(b.start_time <= thoi_diem < b.end_time for b in room_bookings)
            upcoming = any(b.start_time > thoi_diem for b in room_bookings)
            if in_progress:
                status_code = "IN_PROGRESS"
                status_label = "Đang họp"
            elif upcoming:
                status_code = "UPCOMING"
                status_label = "Sắp diễn ra"
            else:
                status_code = "AVAILABLE"
                status_label = "Sẵn sàng"

        results.append({
            "room_id": room.id,
            "room_name": room.name,
            "location": room.location,
            "capacity": room.capacity,
            "amenities": room.amenities,
            "status": status_code,
            "status_label": status_label,
            "bookings_count": len(bookings_by_room.get(room.id, [])),
        })

    return results


def lich_hop_dashboard_hom_nay(ngay=None, thoi_diem=None):
    """
    Lấy danh sách các cuộc họp hôm nay chuẩn hóa cho Dashboard Nhóm 1.
    Khớp 100% với kiểu DashboardMeetingItem trên Frontend:
      - id, room_name, meeting_title, start_time, end_time, time, organizer, status
    """
    if ngay is None:
        ngay = timezone.localdate()
    if thoi_diem is None:
        thoi_diem = timezone.localtime().time()

    bookings = MeetingBooking.objects.filter(
        date=ngay,
        trang_thai=MeetingBooking.Status.CONFIRMED,
    ).select_related("room", "organizer", "department").order_by("start_time")

    items = []
    for b in bookings:
        if b.start_time <= thoi_diem < b.end_time:
            meeting_status = "Đang họp"
        elif b.start_time > thoi_diem:
            meeting_status = "Sắp diễn ra"
        else:
            meeting_status = "Đã kết thúc"

        organizer_name = b.organizer.ho_ten or b.organizer.username
        department_name = b.department.ten if b.department else ""
        organizer_display = f"{organizer_name} ({department_name})" if department_name else organizer_name

        time_str = f"{b.start_time.strftime('%H:%M')} - {b.end_time.strftime('%H:%M')}"

        items.append({
            "id": str(b.id),
            "room_name": b.room.name,
            "roomName": b.room.name,
            "meeting_title": b.title,
            "topic": b.title,
            "start_time": b.start_time.strftime("%H:%M"),
            "end_time": b.end_time.strftime("%H:%M"),
            "time": time_str,
            "organizer": organizer_display,
            "department": department_name,
            "status": meeting_status,
            "attendees_count": b.attendees_count,
        })

    return items
