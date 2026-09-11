-- EcoMart - Database schema for Microsoft SQL Server 2019+
-- Based on EcoMart_ERD.md. Run this script on a new/empty database.

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'ecomart')
    EXEC(N'CREATE SCHEMA ecomart');
GO

CREATE TABLE ecomart.roles (
    role_id SMALLINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_roles PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL CONSTRAINT UQ_roles_role_name UNIQUE,
    description NVARCHAR(255) NULL,
    CONSTRAINT CK_roles_role_name CHECK (role_name IN ('CUSTOMER', 'MANAGER', 'ADMIN'))
);
GO

CREATE TABLE ecomart.app_users (
    user_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_app_users PRIMARY KEY,
    role_id SMALLINT NOT NULL,
    full_name NVARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    email_normalized AS LOWER(email) PERSISTED,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_app_users_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_app_users_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_app_users_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_app_users_roles FOREIGN KEY (role_id) REFERENCES ecomart.roles(role_id),
    CONSTRAINT CK_app_users_full_name CHECK (LEN(LTRIM(RTRIM(full_name))) > 0),
    CONSTRAINT CK_app_users_email_not_blank CHECK (LEN(LTRIM(RTRIM(email))) > 0)
);
GO

CREATE UNIQUE INDEX UX_app_users_email_lower ON ecomart.app_users (email_normalized);
GO

CREATE TABLE ecomart.password_reset_requests (
    reset_request_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_password_reset_requests PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reset_token VARCHAR(255) NOT NULL CONSTRAINT UQ_password_reset_requests_reset_token UNIQUE,
    expires_at DATETIME2(0) NOT NULL,
    used_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_password_reset_requests_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_password_reset_requests_app_users FOREIGN KEY (user_id) REFERENCES ecomart.app_users(user_id),
    CONSTRAINT CK_password_reset_requests_token CHECK (LEN(LTRIM(RTRIM(reset_token))) > 0),
    CONSTRAINT CK_password_reset_requests_expiry CHECK (expires_at > created_at)
);
GO

CREATE INDEX IX_password_reset_requests_user_id ON ecomart.password_reset_requests (user_id);
GO

CREATE TABLE ecomart.addresses (
    address_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_addresses PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recipient_name NVARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    address_detail NVARCHAR(255) NOT NULL,
    ward NVARCHAR(150) NULL,
    district NVARCHAR(150) NOT NULL,
    province NVARCHAR(150) NOT NULL,
    is_default BIT NOT NULL CONSTRAINT DF_addresses_is_default DEFAULT (0),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_addresses_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_addresses_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_addresses_app_users FOREIGN KEY (user_id) REFERENCES ecomart.app_users(user_id),
    CONSTRAINT CK_addresses_recipient_name CHECK (LEN(LTRIM(RTRIM(recipient_name))) > 0),
    CONSTRAINT CK_addresses_recipient_phone CHECK (LEN(LTRIM(RTRIM(recipient_phone))) > 0),
    CONSTRAINT CK_addresses_address_detail CHECK (LEN(LTRIM(RTRIM(address_detail))) > 0)
);
GO

CREATE INDEX IX_addresses_user_id ON ecomart.addresses (user_id);
CREATE UNIQUE INDEX UX_addresses_one_default_per_user ON ecomart.addresses (user_id) WHERE is_default = 1;
GO

CREATE TABLE ecomart.categories (
    category_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_categories PRIMARY KEY,
    category_name NVARCHAR(150) NOT NULL CONSTRAINT UQ_categories_category_name UNIQUE,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_categories_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_categories_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_categories_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_categories_name CHECK (LEN(LTRIM(RTRIM(category_name))) > 0)
);
GO

CREATE TABLE ecomart.brands (
    brand_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_brands PRIMARY KEY,
    brand_name NVARCHAR(150) NOT NULL CONSTRAINT UQ_brands_brand_name UNIQUE,
    description NVARCHAR(500) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_brands_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_brands_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_brands_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_brands_name CHECK (LEN(LTRIM(RTRIM(brand_name))) > 0)
);
GO

CREATE TABLE ecomart.products (
    product_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_products PRIMARY KEY,
    category_id BIGINT NOT NULL,
    brand_id BIGINT NOT NULL,
    product_name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    selling_price DECIMAL(14,2) NOT NULL,
    original_price DECIMAL(14,2) NULL,
    eco_score SMALLINT NULL,
    material_info NVARCHAR(500) NULL,
    is_visible BIT NOT NULL CONSTRAINT DF_products_is_visible DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_products_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_products_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_products_categories FOREIGN KEY (category_id) REFERENCES ecomart.categories(category_id),
    CONSTRAINT FK_products_brands FOREIGN KEY (brand_id) REFERENCES ecomart.brands(brand_id),
    CONSTRAINT CK_products_name CHECK (LEN(LTRIM(RTRIM(product_name))) > 0),
    CONSTRAINT CK_products_selling_price CHECK (selling_price > 0),
    CONSTRAINT CK_products_eco_score CHECK (eco_score IS NULL OR eco_score BETWEEN 1 AND 5),
    CONSTRAINT CK_products_original_price CHECK (original_price IS NULL OR original_price > selling_price)
);
GO

CREATE INDEX IX_products_category_visible ON ecomart.products (category_id, is_visible);
CREATE INDEX IX_products_brand_visible ON ecomart.products (brand_id, is_visible);
CREATE INDEX IX_products_visible_price ON ecomart.products (is_visible, selling_price);
CREATE INDEX IX_products_product_name ON ecomart.products (product_name);
GO

CREATE TABLE ecomart.product_images (
    product_image_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_product_images PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(2048) NOT NULL,
    is_primary BIT NOT NULL CONSTRAINT DF_product_images_is_primary DEFAULT (0),
    display_order INT NOT NULL CONSTRAINT DF_product_images_display_order DEFAULT (0),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_product_images_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_product_images_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT CK_product_images_url CHECK (LEN(LTRIM(RTRIM(image_url))) > 0),
    CONSTRAINT CK_product_images_display_order CHECK (display_order >= 0)
);
GO

CREATE INDEX IX_product_images_product_order ON ecomart.product_images (product_id, display_order);
CREATE UNIQUE INDEX UX_product_images_one_primary_per_product
    ON ecomart.product_images (product_id) WHERE is_primary = 1;
GO

CREATE TABLE ecomart.certifications (
    certification_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_certifications PRIMARY KEY,
    certification_name NVARCHAR(150) NOT NULL CONSTRAINT UQ_certifications_name UNIQUE,
    description NVARCHAR(500) NULL,
    icon_url VARCHAR(2048) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_certifications_is_active DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_certifications_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_certifications_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_certifications_name CHECK (LEN(LTRIM(RTRIM(certification_name))) > 0)
);
GO

CREATE TABLE ecomart.product_certifications (
    product_id BIGINT NOT NULL,
    certification_id BIGINT NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_product_certifications_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_product_certifications PRIMARY KEY (product_id, certification_id),
    CONSTRAINT FK_product_certifications_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT FK_product_certifications_certifications FOREIGN KEY (certification_id) REFERENCES ecomart.certifications(certification_id)
);
GO

CREATE INDEX IX_product_certifications_certification_id ON ecomart.product_certifications (certification_id);
GO

CREATE TABLE ecomart.inventory (
    product_id BIGINT NOT NULL CONSTRAINT PK_inventory PRIMARY KEY,
    quantity_in_stock INT NOT NULL CONSTRAINT DF_inventory_quantity_in_stock DEFAULT (0),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_inventory_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_inventory_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT CK_inventory_quantity CHECK (quantity_in_stock >= 0)
);
GO

CREATE TABLE ecomart.carts (
    cart_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_carts PRIMARY KEY,
    user_id BIGINT NOT NULL CONSTRAINT UQ_carts_user_id UNIQUE,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_carts_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_carts_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_carts_app_users FOREIGN KEY (user_id) REFERENCES ecomart.app_users(user_id)
);
GO

CREATE TABLE ecomart.cart_items (
    cart_item_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_cart_items PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_cart_items_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_cart_items_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_cart_items_carts FOREIGN KEY (cart_id) REFERENCES ecomart.carts(cart_id) ON DELETE CASCADE,
    CONSTRAINT FK_cart_items_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT UQ_cart_items_cart_product UNIQUE (cart_id, product_id),
    CONSTRAINT CK_cart_items_quantity CHECK (quantity > 0)
);
GO

CREATE INDEX IX_cart_items_product_id ON ecomart.cart_items (product_id);
GO

CREATE TABLE ecomart.order_statuses (
    status_code VARCHAR(20) NOT NULL CONSTRAINT PK_order_statuses PRIMARY KEY,
    status_name NVARCHAR(100) NOT NULL CONSTRAINT UQ_order_statuses_status_name UNIQUE,
    description NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE ecomart.orders (
    order_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_orders PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status_code VARCHAR(20) NOT NULL,
    order_code VARCHAR(30) NOT NULL CONSTRAINT UQ_orders_order_code UNIQUE,
    payment_method VARCHAR(10) NOT NULL CONSTRAINT DF_orders_payment_method DEFAULT ('COD'),
    payment_status VARCHAR(20) NOT NULL CONSTRAINT DF_orders_payment_status DEFAULT ('UNPAID'),
    total_amount DECIMAL(14,2) NOT NULL,
    recipient_name NVARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    delivery_address NVARCHAR(600) NOT NULL,
    cancellation_reason NVARCHAR(MAX) NULL,
    ordered_at DATETIME2(0) NOT NULL CONSTRAINT DF_orders_ordered_at DEFAULT (SYSUTCDATETIME()),
    confirmed_at DATETIME2(0) NULL,
    completed_at DATETIME2(0) NULL,
    cancelled_at DATETIME2(0) NULL,
    paid_at DATETIME2(0) NULL,
    CONSTRAINT FK_orders_app_users FOREIGN KEY (user_id) REFERENCES ecomart.app_users(user_id),
    CONSTRAINT FK_orders_order_statuses FOREIGN KEY (status_code) REFERENCES ecomart.order_statuses(status_code),
    CONSTRAINT CK_orders_code CHECK (LEN(LTRIM(RTRIM(order_code))) > 0),
    CONSTRAINT CK_orders_total_amount CHECK (total_amount > 0),
    CONSTRAINT CK_orders_payment_method CHECK (payment_method IN ('COD', 'VNPAY', 'SEPAY')),
    CONSTRAINT CK_orders_payment_status CHECK (payment_status IN ('UNPAID', 'PAID', 'FAILED', 'REFUNDED')),
    CONSTRAINT CK_orders_recipient_name CHECK (LEN(LTRIM(RTRIM(recipient_name))) > 0),
    CONSTRAINT CK_orders_recipient_phone CHECK (LEN(LTRIM(RTRIM(recipient_phone))) > 0),
    CONSTRAINT CK_orders_delivery_address CHECK (LEN(LTRIM(RTRIM(delivery_address))) > 0),
    CONSTRAINT CK_orders_cancelled_data CHECK (
        (status_code = 'CANCELLED' AND cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
        OR (status_code <> 'CANCELLED' AND cancelled_at IS NULL AND cancellation_reason IS NULL)
    ),
    CONSTRAINT CK_orders_confirmed_data CHECK (
        (status_code IN ('CONFIRMED', 'COMPLETED') AND confirmed_at IS NOT NULL)
        OR (status_code NOT IN ('CONFIRMED', 'COMPLETED') AND confirmed_at IS NULL)
    ),
    CONSTRAINT CK_orders_completed_data CHECK (
        (status_code = 'COMPLETED' AND completed_at IS NOT NULL)
        OR (status_code <> 'COMPLETED' AND completed_at IS NULL)
    )
);
GO

CREATE INDEX IX_orders_user_id_ordered_at ON ecomart.orders (user_id, ordered_at DESC);
CREATE INDEX IX_orders_status_ordered_at ON ecomart.orders (status_code, ordered_at DESC);
GO

CREATE TABLE ecomart.order_items (
    order_item_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_order_items PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name NVARCHAR(255) NOT NULL,
    unit_price DECIMAL(14,2) NOT NULL,
    quantity INT NOT NULL,
    line_total AS CONVERT(DECIMAL(14,2), unit_price * quantity) PERSISTED,
    CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id) REFERENCES ecomart.orders(order_id),
    CONSTRAINT FK_order_items_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT UQ_order_items_order_product UNIQUE (order_id, product_id),
    CONSTRAINT UQ_order_items_id_product UNIQUE (order_item_id, product_id),
    CONSTRAINT CK_order_items_product_name CHECK (LEN(LTRIM(RTRIM(product_name))) > 0),
    CONSTRAINT CK_order_items_unit_price CHECK (unit_price > 0),
    CONSTRAINT CK_order_items_quantity CHECK (quantity > 0)
);
GO

CREATE INDEX IX_order_items_product_id ON ecomart.order_items (product_id);
GO

CREATE TABLE ecomart.payment_transactions (
    transaction_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_payment_transactions PRIMARY KEY,
    order_id BIGINT NOT NULL,
    gateway VARCHAR(20) NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    gateway_transaction_no VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_payment_transactions_status DEFAULT ('PENDING'),
    raw_response NVARCHAR(MAX) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_payment_transactions_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_payment_transactions_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_payment_transactions_orders FOREIGN KEY (order_id) REFERENCES ecomart.orders(order_id),
    CONSTRAINT CK_payment_transactions_gateway CHECK (gateway IN ('VNPAY', 'SEPAY')),
    CONSTRAINT CK_payment_transactions_amount CHECK (amount > 0),
    CONSTRAINT CK_payment_transactions_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED'))
);
GO

CREATE INDEX IX_payment_transactions_order_id ON ecomart.payment_transactions (order_id);
CREATE INDEX IX_payment_transactions_gateway_txno ON ecomart.payment_transactions (gateway, gateway_transaction_no);
GO

CREATE TABLE ecomart.reviews (
    review_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_reviews PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL CONSTRAINT UQ_reviews_order_item_id UNIQUE,
    rating SMALLINT NOT NULL,
    comment NVARCHAR(MAX) NULL,
    is_visible BIT NOT NULL CONSTRAINT DF_reviews_is_visible DEFAULT (1),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_reviews_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_reviews_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_reviews_app_users FOREIGN KEY (user_id) REFERENCES ecomart.app_users(user_id),
    CONSTRAINT FK_reviews_products FOREIGN KEY (product_id) REFERENCES ecomart.products(product_id),
    CONSTRAINT FK_reviews_order_item_product
        FOREIGN KEY (order_item_id, product_id)
        REFERENCES ecomart.order_items(order_item_id, product_id),
    CONSTRAINT CK_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);
GO

CREATE INDEX IX_reviews_product_visible_created_at
    ON ecomart.reviews (product_id, is_visible, created_at DESC);
CREATE INDEX IX_reviews_user_id ON ecomart.reviews (user_id);
GO

-- A review is allowed only when its order belongs to the reviewer and is completed.
CREATE OR ALTER TRIGGER ecomart.trg_reviews_validate_eligibility
ON ecomart.reviews
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Keep the trigger equivalent to PostgreSQL: validate only when the
    -- eligibility-defining columns are inserted or changed.
    IF NOT (UPDATE(user_id) OR UPDATE(product_id) OR UPDATE(order_item_id))
        RETURN;

    IF EXISTS (
        SELECT 1
        FROM inserted AS i
        INNER JOIN ecomart.order_items AS oi
            ON oi.order_item_id = i.order_item_id
           AND oi.product_id = i.product_id
        INNER JOIN ecomart.orders AS o
            ON o.order_id = oi.order_id
        WHERE o.user_id <> i.user_id
           OR o.status_code <> 'COMPLETED'
    )
    BEGIN
        THROW 50001, 'Review is allowed only for a product in the reviewer''s completed order.', 1;
    END;
END;
GO

CREATE TABLE ecomart.contact_messages (
    message_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_contact_messages PRIMARY KEY,
    full_name NVARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(20) NULL,
    subject NVARCHAR(255) NULL,
    content NVARCHAR(MAX) NOT NULL,
    status VARCHAR(20) NOT NULL CONSTRAINT DF_contact_messages_status DEFAULT ('NEW'),
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_contact_messages_created_at DEFAULT (SYSUTCDATETIME()),
    resolved_at DATETIME2(0) NULL,
    CONSTRAINT CK_contact_messages_full_name CHECK (LEN(LTRIM(RTRIM(full_name))) > 0),
    CONSTRAINT CK_contact_messages_content CHECK (LEN(LTRIM(RTRIM(content))) > 0),
    CONSTRAINT CK_contact_messages_status CHECK (status IN ('NEW', 'RESOLVED')),
    CONSTRAINT CK_contact_messages_resolved_data CHECK (
        (status = 'RESOLVED' AND resolved_at IS NOT NULL)
        OR (status = 'NEW' AND resolved_at IS NULL)
    )
);
GO

CREATE INDEX IX_contact_messages_status_created_at ON ecomart.contact_messages (status, created_at DESC);
GO

CREATE TABLE ecomart.content_pages (
    page_id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_content_pages PRIMARY KEY,
    slug VARCHAR(100) NOT NULL CONSTRAINT UQ_content_pages_slug UNIQUE,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_content_pages_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_content_pages_slug CHECK (LEN(LTRIM(RTRIM(slug))) > 0),
    CONSTRAINT CK_content_pages_title CHECK (LEN(LTRIM(RTRIM(title))) > 0)
);
GO

CREATE TABLE ecomart.store_settings (
    setting_key VARCHAR(50) NOT NULL CONSTRAINT PK_store_settings PRIMARY KEY,
    setting_value NVARCHAR(MAX) NULL,
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_store_settings_updated_at DEFAULT (SYSUTCDATETIME())
);
GO

INSERT INTO ecomart.roles (role_name, description)
VALUES
    ('CUSTOMER', N'Khách hàng mua sản phẩm'),
    ('MANAGER', N'Quản lý vận hành và kinh doanh'),
    ('ADMIN', N'Quản trị viên hệ thống');
GO

INSERT INTO ecomart.order_statuses (status_code, status_name, description)
VALUES
    ('PENDING', N'Chờ xác nhận', N'Đơn mới tạo, chờ Admin xử lý'),
    ('CONFIRMED', N'Đã xác nhận', N'Admin đã xác nhận đơn hàng'),
    ('COMPLETED', N'Đã hoàn thành', N'Đơn hàng đã giao thành công'),
    ('CANCELLED', N'Đã hủy', N'Đơn hàng bị Customer hoặc Admin hủy');
GO

INSERT INTO ecomart.content_pages (slug, title, content)
VALUES
    ('return-policy', N'Chính sách đổi trả', N'Nội dung chính sách đổi trả — Admin cập nhật.'),
    ('warranty-policy', N'Chính sách bảo hành', N'Nội dung chính sách bảo hành — Admin cập nhật.'),
    ('shipping-policy', N'Chính sách vận chuyển', N'Nội dung chính sách vận chuyển — Admin cập nhật.');
GO

INSERT INTO ecomart.store_settings (setting_key, setting_value)
VALUES
    ('store_phone', N''),
    ('store_email', N''),
    ('store_address', N''),
    ('map_embed_url', N'');
GO
