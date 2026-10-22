-- ============================================================================
-- SCRIPT SQL SEED DATA MẪU CHO DASHBOARD (NHÓM 1) - CUNG CẤP BỞI NHÓM 7
-- ============================================================================
-- Tương thích: PostgreSQL 16 (Chuẩn schema release_DDL.sql)
-- Đặc điểm: Sử dụng CURRENT_DATE động để dữ liệu sinh nhật và lịch họp luôn
--           khớp với ngày chạy thực tế.
-- ============================================================================

BEGIN;

-- 1. DANH MỤC PHÒNG HỌP (3 phòng chuẩn theo yêu cầu của Nhóm trưởng Tân)
INSERT INTO meetings_meetingroom (name, location, capacity, amenities, is_public, trang_thai, ghi_chu, created_at, updated_at)
VALUES 
  ('Phòng họp A1', 'Tầng 1 - Khu Hành chính', 20, 'Máy chiếu 4K, Âm thanh hội nghị, Bảng tương tác, Điều hòa', TRUE, 'AVAILABLE', 'Phòng họp tiêu chuẩn giao ban lãnh đạo', now(), now()),
  ('Phòng trực tuyến B2', 'Tầng 2 - Khu Kỹ thuật', 15, 'Polycom truyền hình số, Camera 360, Mic đa hướng, TV 75 inch', TRUE, 'AVAILABLE', 'Phòng chuyên dụng họp trực tuyến đa điểm', now(), now()),
  ('Phòng Hội trường A', 'Tầng 1 - Trung tâm hội nghị', 100, 'Sân khấu lớn, Âm thanh vòm, 2 màn chiếu 300 inch, Bục phát biểu, Livestream', TRUE, 'AVAILABLE', 'Hội trường tổ chức đại hội, tổng kết và sự kiện lớn', now(), now())
ON CONFLICT (name) DO UPDATE SET
  location = EXCLUDED.location,
  capacity = EXCLUDED.capacity,
  amenities = EXCLUDED.amenities,
  trang_thai = EXCLUDED.trang_thai,
  updated_at = now();

-- 2. DỮ LIỆU SINH NHẬT NHÂN VIÊN (2 người hôm nay, 1 người ngày mai)
-- Lấy id của chức vụ và đơn vị tương ứng
DO $$
DECLARE
  v_pos_truong_phong INT;
  v_pos_pho_phong INT;
  v_pos_chuyen_vien INT;
  v_dv_cntt INT;
  v_dv_hchq INT;
  v_dv_tckh INT;
  v_room_a1 INT;
  v_room_b2 INT;
  v_user_an INT;
  v_user_mai INT;
BEGIN
  -- Lấy Chức vụ
  SELECT id INTO v_pos_truong_phong FROM accounts_position WHERE name = 'Trưởng phòng' LIMIT 1;
  SELECT id INTO v_pos_pho_phong FROM accounts_position WHERE name = 'Phó phòng' LIMIT 1;
  SELECT id INTO v_pos_chuyen_vien FROM accounts_position WHERE name = 'Chuyên viên' LIMIT 1;

  -- Lấy Đơn vị
  SELECT id INTO v_dv_cntt FROM organizations_donvi WHERE ten = 'Ban công nghệ thông tin' LIMIT 1;
  SELECT id INTO v_dv_hchq FROM organizations_donvi WHERE ten = 'Ban hành chính quản trị' LIMIT 1;
  SELECT id INTO v_dv_tckh FROM organizations_donvi WHERE ten = 'Ban tài chính kế hoạch' LIMIT 1;

  -- 2.1 Cán bộ 1: Nguyễn Văn An - Sinh nhật Hôm nay
  INSERT INTO accounts_employee (
    username, password, ho_ten, ngay_sinh, email, sdt,
    chuc_vu_id, don_vi_id, is_active, is_staff, is_superuser, trang_thai, is_public, created_at, updated_at
  ) VALUES (
    'nguyen_van_an', 'pbkdf2_sha256$870000$placeholder$dummyhash',
    'Nguyễn Văn An', CURRENT_DATE - INTERVAL '33 years', 'nguyen_van_an@baolong.vn', '0908111222',
    v_pos_chuyen_vien, v_dv_cntt, TRUE, FALSE, FALSE, 'LAM_VIEC', TRUE, now(), now()
  )
  ON CONFLICT (username) DO UPDATE SET
    ho_ten = EXCLUDED.ho_ten,
    ngay_sinh = EXCLUDED.ngay_sinh,
    chuc_vu_id = EXCLUDED.chuc_vu_id,
    don_vi_id = EXCLUDED.don_vi_id,
    updated_at = now()
  RETURNING id INTO v_user_an;

  -- 2.2 Cán bộ 2: Trần Thị Mai - Sinh nhật Hôm nay
  INSERT INTO accounts_employee (
    username, password, ho_ten, ngay_sinh, email, sdt,
    chuc_vu_id, don_vi_id, is_active, is_staff, is_superuser, trang_thai, is_public, created_at, updated_at
  ) VALUES (
    'tran_thi_mai', 'pbkdf2_sha256$870000$placeholder$dummyhash',
    'Trần Thị Mai', CURRENT_DATE - INTERVAL '38 years', 'tran_thi_mai@baolong.vn', '0908333444',
    v_pos_truong_phong, v_dv_hchq, TRUE, FALSE, FALSE, 'LAM_VIEC', TRUE, now(), now()
  )
  ON CONFLICT (username) DO UPDATE SET
    ho_ten = EXCLUDED.ho_ten,
    ngay_sinh = EXCLUDED.ngay_sinh,
    chuc_vu_id = EXCLUDED.chuc_vu_id,
    don_vi_id = EXCLUDED.don_vi_id,
    updated_at = now()
  RETURNING id INTO v_user_mai;

  -- 2.3 Cán bộ 3: Lê Hoàng Nam - Sinh nhật Ngày mai
  INSERT INTO accounts_employee (
    username, password, ho_ten, ngay_sinh, email, sdt,
    chuc_vu_id, don_vi_id, is_active, is_staff, is_superuser, trang_thai, is_public, created_at, updated_at
  ) VALUES (
    'le_hoang_nam', 'pbkdf2_sha256$870000$placeholder$dummyhash',
    'Lê Hoàng Nam', (CURRENT_DATE + INTERVAL '1 day') - INTERVAL '31 years', 'le_hoang_nam@baolong.vn', '0908555666',
    v_pos_pho_phong, v_dv_tckh, TRUE, FALSE, FALSE, 'LAM_VIEC', TRUE, now(), now()
  )
  ON CONFLICT (username) DO UPDATE SET
    ho_ten = EXCLUDED.ho_ten,
    ngay_sinh = EXCLUDED.ngay_sinh,
    chuc_vu_id = EXCLUDED.chuc_vu_id,
    don_vi_id = EXCLUDED.don_vi_id,
    updated_at = now();

  -- Lấy id phòng họp
  SELECT id INTO v_room_a1 FROM meetings_meetingroom WHERE name = 'Phòng họp A1';
  SELECT id INTO v_room_b2 FROM meetings_meetingroom WHERE name = 'Phòng trực tuyến B2';

  -- Xóa booking cũ hôm nay của 2 phòng này để tránh conflict excl_room_time
  DELETE FROM meetings_meetingbooking WHERE date = CURRENT_DATE AND room_id IN (v_room_a1, v_room_b2);

  -- 3. LỊCH HỌP HÔM NAY (Đang họp & Sắp diễn ra)
  -- 3.1 Phòng A1: Cuộc họp đang diễn ra (Bắt đầu 09:00, Kết thúc 11:30)
  INSERT INTO meetings_meetingbooking (
    room_id, organizer_id, department_id, title, date, start_time, end_time, attendees_count, purpose, trang_thai, created_at
  ) VALUES (
    v_room_a1, v_user_mai, v_dv_hchq,
    'Họp giao ban Lãnh đạo các Ban chuyên môn',
    CURRENT_DATE, '09:00:00', '11:30:00', 12,
    'Đánh giá tiến độ triển khai dự án quý và nhiệm vụ trọng tâm tuần.',
    'CONFIRMED', now()
  );

  -- 3.2 Phòng B2: Cuộc họp sắp diễn ra (Bắt đầu 14:00, Kết thúc 16:30)
  INSERT INTO meetings_meetingbooking (
    room_id, organizer_id, department_id, title, date, start_time, end_time, attendees_count, purpose, trang_thai, created_at
  ) VALUES (
    v_room_b2, v_user_an, v_dv_cntt,
    'Hội nghị trực tuyến thẩm định hồ sơ kỹ thuật số',
    CURRENT_DATE, '14:00:00', '16:30:00', 8,
    'Thống nhất kiến trúc tích hợp hệ thống số hóa văn bản và hồ sơ.',
    'CONFIRMED', now()
  );

END $$;

COMMIT;
