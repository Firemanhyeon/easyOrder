USE easy_order;

-- 관리자 더미 데이터 (비밀번호는 'password123'의 해시값)
INSERT INTO admins (email, password, name, role) VALUES
('admin@easyorder.com', '$2b$10$YourHashedPasswordHere', '관리자', 'admin'),
('owner1@restaurant.com', '$2b$10$YourHashedPasswordHere', '김점주', 'store_owner'),
('owner2@sushi.com', '$2b$10$YourHashedPasswordHere', '이점주', 'store_owner');

-- 가게 더미 데이터
INSERT INTO stores (name, address, phone, qr_code, admin_id) VALUES
('맛있는 한식당', '서울시 강남구 테헤란로 123', '02-123-4567', 'QR_STORE_001', 2),
('신선한 초밥집', '서울시 서초구 서초대로 456', '02-234-5678', 'QR_STORE_002', 3);

-- 메뉴 카테고리 더미 데이터
INSERT INTO menu_categories (store_id, name, display_order) VALUES
-- 한식당 카테고리
(1, '메인 요리', 1),
(1, '국물 요리', 2),
(1, '사이드 메뉴', 3),
(1, '음료', 4),
-- 초밥집 카테고리
(2, '스시', 1),
(2, '사시미', 2),
(2, '세트 메뉴', 3),
(2, '음료', 4);

-- 메뉴 아이템 더미 데이터
INSERT INTO menu_items (store_id, category_id, name, description, price, image_url, is_available) VALUES
-- 한식당 메뉴
(1, 1, '불고기', '맛있는 불고기', 12000, 'https://via.placeholder.com/150', true),
(1, 1, '비빔밥', '신선한 채소가 듬뿍', 9000, 'https://via.placeholder.com/150', true),
(1, 2, '김치찌개', '얼큰한 김치찌개', 8000, 'https://via.placeholder.com/150', true),
(1, 2, '된장찌개', '구수한 된장찌개', 8000, 'https://via.placeholder.com/150', true),
(1, 3, '공기밥', '고슬고슬한 밥', 1000, 'https://via.placeholder.com/150', true),
(1, 4, '콜라', '시원한 콜라', 2000, 'https://via.placeholder.com/150', true),
(1, 4, '사이다', '시원한 사이다', 2000, 'https://via.placeholder.com/150', true),

-- 초밥집 메뉴
(2, 5, '연어 스시', '신선한 연어 스시', 15000, 'https://via.placeholder.com/150', true),
(2, 5, '참치 스시', '신선한 참치 스시', 18000, 'https://via.placeholder.com/150', true),
(2, 6, '연어 사시미', '신선한 연어 사시미', 20000, 'https://via.placeholder.com/150', true),
(2, 6, '참치 사시미', '신선한 참치 사시미', 25000, 'https://via.placeholder.com/150', true),
(2, 7, '스페셜 스시 세트', '다양한 스시 세트', 35000, 'https://via.placeholder.com/150', true),
(2, 8, '녹차', '따뜻한 녹차', 1000, 'https://via.placeholder.com/150', true),
(2, 8, '맥주', '시원한 생맥주', 4000, 'https://via.placeholder.com/150', true);

-- 주문 더미 데이터
INSERT INTO orders (store_id, table_number, total_amount, status) VALUES
(1, 1, 21000, 'completed'),
(1, 2, 17000, 'pending'),
(2, 1, 35000, 'confirmed'),
(2, 3, 45000, 'pending');

-- 주문 상세 더미 데이터
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES
(1, 1, 1, 12000),  -- 불고기 1개
(1, 6, 1, 2000),   -- 콜라 1개
(1, 5, 2, 1000),   -- 공기밥 2개
(2, 2, 1, 9000),   -- 비빔밥 1개
(2, 7, 1, 2000),   -- 사이다 1개
(2, 5, 2, 1000),   -- 공기밥 2개
(3, 11, 1, 35000), -- 스페셜 스시 세트 1개
(4, 8, 1, 15000),  -- 연어 스시 1개
(4, 9, 1, 18000),  -- 참치 스시 1개
(4, 13, 1, 4000);  -- 맥주 1개 