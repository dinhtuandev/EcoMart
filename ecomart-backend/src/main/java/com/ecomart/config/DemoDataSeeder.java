package com.ecomart.config;

import com.ecomart.entity.*;
import com.ecomart.entity.enums.ContactStatus;
import com.ecomart.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CertificationRepository certificationRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryRepository inventoryRepository;
    private final ContactMessageRepository contactMessageRepository;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Kiểm tra và khởi tạo dữ liệu mẫu (Demo Data Seeder) cho hệ thống EcoMart...");

        // 1. Seed Certifications
        Map<String, Certification> certMap = new HashMap<>();
        List<Certification> certs = List.of(
                Certification.builder()
                        .name("FSC Certified")
                        .description("Chứng nhận quản lý rừng và gỗ bền vững theo tiêu chuẩn quốc tế")
                        .iconUrl("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100")
                        .isActive(true)
                        .build(),
                Certification.builder()
                        .name("USDA Organic")
                        .description("Chứng nhận nông nghiệp hữu cơ tiêu chuẩn của Bộ Nông nghiệp Hoa Kỳ")
                        .iconUrl("https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=100")
                        .isActive(true)
                        .build(),
                Certification.builder()
                        .name("Global Recycled Standard (GRS)")
                        .description("Tiêu chuẩn toàn cầu về tỷ lệ thành phần vật liệu tái chế")
                        .iconUrl("https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=100")
                        .isActive(true)
                        .build(),
                Certification.builder()
                        .name("Fair Trade Certified")
                        .description("Chứng nhận thương mại công bằng và phát triển cộng đồng bền vững")
                        .iconUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=100")
                        .isActive(true)
                        .build(),
                Certification.builder()
                        .name("OEKO-TEX Standard 100")
                        .description("Đảm bảo an toàn dệt may không chứa chất độc hại cho sức khỏe")
                        .iconUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100")
                        .isActive(true)
                        .build(),
                Certification.builder()
                        .name("Cruelty-Free & Vegan")
                        .description("100% thuần chay, cam kết không thử nghiệm trên động vật")
                        .iconUrl("https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100")
                        .isActive(true)
                        .build()
        );

        for (Certification c : certs) {
            Certification item = certificationRepository.findByName(c.getName())
                    .orElseGet(() -> certificationRepository.save(c));
            certMap.put(item.getName(), item);
        }

        // 2. Seed Categories
        Map<String, Category> catMap = new HashMap<>();
        List<Category> categories = List.of(
                Category.builder()
                        .name("Gia Dụng Xanh")
                        .description("Đồ dùng nhà bếp, bình nước, hộp cơm sinh học từ vật liệu tự nhiên")
                        .isActive(true)
                        .build(),
                Category.builder()
                        .name("Thời Trang Bền Vững")
                        .description("Quần áo, túi xách từ sợi đay, sợi bông hữu cơ và vải tái chế")
                        .isActive(true)
                        .build(),
                Category.builder()
                        .name("Mỹ Phẩm Thuần Chay")
                        .description("Sản phẩm chăm sóc da và cơ thể từ thực vật, an toàn tuyệt đối")
                        .isActive(true)
                        .build(),
                Category.builder()
                        .name("Thực Phẩm Hữu Cơ")
                        .description("Nông sản sạch, hạt dinh dưỡng, gia vị đạt tiêu chuẩn USDA Organic")
                        .isActive(true)
                        .build(),
                Category.builder()
                        .name("Chăm Sóc Cá Nhân Zero-Waste")
                        .description("Bàn chải tre, xà phòng thiên nhiên, giảm thiểu rác thải nhựa")
                        .isActive(true)
                        .build()
        );

        for (Category cat : categories) {
            Category item = categoryRepository.findByName(cat.getName())
                    .orElseGet(() -> categoryRepository.save(cat));
            catMap.put(item.getName(), item);
        }

        // 3. Seed Brands
        Map<String, Brand> brandMap = new HashMap<>();
        List<Brand> brands = List.of(
                Brand.builder()
                        .name("EcoLiving Vietnam")
                        .description("Tiên phong giải pháp tiêu dùng xanh và tái sinh vật liệu tại Việt Nam")
                        .isActive(true)
                        .build(),
                Brand.builder()
                        .name("Bamboo Life")
                        .description("Chuyên sản xuất sản phẩm gia dụng và cá nhân từ tre tự nhiên")
                        .isActive(true)
                        .build(),
                Brand.builder()
                        .name("Cocoon Vegan")
                        .description("Mỹ phẩm 100% thuần chay thuần khiết từ nông sản bản địa Việt Nam")
                        .isActive(true)
                        .build(),
                Brand.builder()
                        .name("Green Earth Co.")
                        .description("Thời trang và bao bì sinh học tự phân hủy thân thiện môi trường")
                        .isActive(true)
                        .build(),
                Brand.builder()
                        .name("Annam Organic")
                        .description("Nông sản hữu cơ và thực phẩm sạch từ nông trại sinh thái")
                        .isActive(true)
                        .build()
        );

        for (Brand b : brands) {
            Brand item = brandRepository.findByName(b.getName())
                    .orElseGet(() -> brandRepository.save(b));
            brandMap.put(item.getName(), item);
        }

        // 4. Seed 10 Demo Products with Images & Inventories
        createDemoProductIfAbsent(
                "Bình Giữ Nhiệt Vỏ Tre Tự Nhiên EcoBottle 500ml",
                "Bình giữ nhiệt chất liệu inox 304 bên trong kết hợp vỏ tre tự nhiên gia công tỉ mỉ bên ngoài. Giữ nhiệt nóng 8 giờ và lạnh 12 giờ.",
                new BigDecimal("280000"),
                new BigDecimal("350000"),
                5,
                "Tre tự nhiên rừng trồng + Ruột inox 304 cao cấp",
                catMap.get("Gia Dụng Xanh"),
                brandMap.get("EcoLiving Vietnam"),
                List.of(certMap.get("FSC Certified")),
                List.of(
                        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
                        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
                ),
                50
        );

        createDemoProductIfAbsent(
                "Bộ 4 Bàn Chải Đánh Răng Tre Kháng Khuẩn Zero-Waste",
                "Cán bàn chải 100% bằng tre tự nhiên phân hủy sinh học, lông bàn chải than hoạt tính kháng khuẩn mềm mại bảo vệ nướu.",
                new BigDecimal("75000"),
                new BigDecimal("95000"),
                5,
                "Thân tre tự nhiên + Sợi than tre hoạt tính",
                catMap.get("Chăm Sóc Cá Nhân Zero-Waste"),
                brandMap.get("Bamboo Life"),
                List.of(certMap.get("FSC Certified"), certMap.get("Cruelty-Free & Vegan")),
                List.of(
                        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=600",
                        "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&q=80&w=600"
                ),
                120
        );

        createDemoProductIfAbsent(
                "Túi Tote Canvas Sợi Đay Tự Nhiên GreenLife",
                "Túi vải tote đựng đồ dạo phố và đi chợ thay thế túi nilon, đường may chắc chắn, chịu lực lên đến 15kg.",
                new BigDecimal("145000"),
                new BigDecimal("180000"),
                4,
                "Sợi đay hữu cơ kết hợp vải canvas mộc tự nhiên",
                catMap.get("Thời Trang Bền Vững"),
                brandMap.get("Green Earth Co."),
                List.of(certMap.get("Global Recycled Standard (GRS)"), certMap.get("Fair Trade Certified")),
                List.of(
                        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
                        "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=600"
                ),
                65
        );

        createDemoProductIfAbsent(
                "Xà Phòng Dầu Dừa & Than Tre Hữu Cơ Cocoon 100g",
                "Xà phòng thảo mộc làm sạch sâu lỗ chân lông, dưỡng ẩm tự nhiên, không chứa hạt vi nhựa hay paraben.",
                new BigDecimal("68000"),
                new BigDecimal("85000"),
                5,
                "Dầu dừa Bến Tre ép lạnh + Than tre hoạt tính",
                catMap.get("Mỹ Phẩm Thuần Chay"),
                brandMap.get("Cocoon Vegan"),
                List.of(certMap.get("Cruelty-Free & Vegan"), certMap.get("USDA Organic")),
                List.of(
                        "https://images.unsplash.com/photo-1607006314143-6c84c1f6d3f2?auto=format&fit=crop&q=80&w=600",
                        "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80&w=600"
                ),
                90
        );

        createDemoProductIfAbsent(
                "Set 50 Hộp Cơm Bã Mía Tự Phân Hủy Sinh Học 600ml",
                "Hộp đựng thức ăn chịu nhiệt tốt, dùng được trong lò vi sóng, phân hủy hoàn toàn trong đất sau 45-60 ngày.",
                new BigDecimal("125000"),
                new BigDecimal("150000"),
                5,
                "100% bã mía tự nhiên không chất tẩy trắng",
                catMap.get("Gia Dụng Xanh"),
                brandMap.get("EcoLiving Vietnam"),
                List.of(certMap.get("FSC Certified")),
                List.of(
                        "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?auto=format&fit=crop&q=80&w=600"
                ),
                40
        );

        createDemoProductIfAbsent(
                "Hộp 100 Ống Hút Cỏ Bàng Tự Nhiên Sấy Khô 20cm",
                "Ống hút làm thủ công từ cỏ bàng tự nhiên vùng Đồng Tháp Mười, không ngâm hóa chất, dùng được cho nước nóng và lạnh.",
                new BigDecimal("55000"),
                new BigDecimal("70000"),
                5,
                "Cỏ bàng tự nhiên sấy khô tiệt trùng UV",
                catMap.get("Gia Dụng Xanh"),
                brandMap.get("Green Earth Co."),
                List.of(certMap.get("USDA Organic")),
                List.of(
                        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&q=80&w=600"
                ),
                150
        );

        createDemoProductIfAbsent(
                "Áo Thun Cotton Hữu Cơ Unisex Tái Chế EcoTee",
                "Áo thun phong cách basic dệt từ sợi cotton hữu cơ tái chế, mềm mại, thoáng mát và thân thiện với làn da.",
                new BigDecimal("220000"),
                new BigDecimal("290000"),
                4,
                "100% Organic Cotton đạt chuẩn dệt may quốc tế",
                catMap.get("Thời Trang Bền Vững"),
                brandMap.get("Green Earth Co."),
                List.of(certMap.get("OEKO-TEX Standard 100"), certMap.get("Global Recycled Standard (GRS)")),
                List.of(
                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600"
                ),
                45
        );

        createDemoProductIfAbsent(
                "Nước Giặt Sinh Học Lên Men Từ Dứa EcoClean 2L",
                "Nước giặt enzyme lên men từ vỏ dứa tự nhiên, an toàn cho trẻ nhỏ và người có làn da nhạy cảm, nước thải an toàn cho môi trường.",
                new BigDecimal("165000"),
                new BigDecimal("195000"),
                5,
                "Enzyme dứa lên men tự nhiên + Tinh dầu tràm trà",
                catMap.get("Gia Dụng Xanh"),
                brandMap.get("EcoLiving Vietnam"),
                List.of(certMap.get("Cruelty-Free & Vegan")),
                List.of(
                        "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=600"
                ),
                35
        );

        createDemoProductIfAbsent(
                "Ly Gốm Sứ Thủ Công Mộc Men Tro Tràng An 350ml",
                "Ly uống nước gốm sứ mộc nung củi nhiệt độ cao, men tro tự nhiên không chì, lưu giữ phong vị đồ uống trọn vẹn.",
                new BigDecimal("95000"),
                new BigDecimal("120000"),
                4,
                "Đất sét tự nhiên + Men tro nung nhiệt độ cao 1250°C",
                catMap.get("Gia Dụng Xanh"),
                brandMap.get("Bamboo Life"),
                List.of(certMap.get("Fair Trade Certified")),
                List.of(
                        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600"
                ),
                80
        );

        createDemoProductIfAbsent(
                "Hạt Điều Hữu Cơ Rang Củi Bình Phước Annam 250g",
                "Hạt điều chuẩn USDA Organic thu hoạch từ vườn điều sinh thái Bình Phước, rang củi giữ trọn vị ngọt bùi tự nhiên.",
                new BigDecimal("135000"),
                new BigDecimal("160000"),
                5,
                "100% hạt điều hữu cơ Bình Phước loại 1",
                catMap.get("Thực Phẩm Hữu Cơ"),
                brandMap.get("Annam Organic"),
                List.of(certMap.get("USDA Organic"), certMap.get("Fair Trade Certified")),
                List.of(
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
                ),
                70
        );

        // 5. Seed Contact Messages for Demo Inbox
        if (contactMessageRepository.count() == 0) {
            List<ContactMessage> messages = List.of(
                    ContactMessage.builder()
                            .fullName("Nguyễn Văn An")
                            .email("an.nguyen@gmail.com")
                            .phone("0912345678")
                            .subject("Hỏi về chính sách đại lý phân phối sản phẩm xanh")
                            .content("Chào EcoMart, tôi là chủ chuỗi cửa hàng tiện lợi tại Quận 1. Tôi muốn tìm hiểu bảng giá sỉ cho bình tre và ống hút cỏ bàng để phân phối.")
                            .status(ContactStatus.NEW)
                            .createdAt(LocalDateTime.now().minusHours(3))
                            .build(),
                    ContactMessage.builder()
                            .fullName("Trần Thị Mai")
                            .email("mai.tran@gmail.com")
                            .phone("0987654321")
                            .subject("Tư vấn quà tặng doanh nghiệp thân thiện môi trường")
                            .content("Công ty tôi muốn đặt 200 set quà tặng gồm bình giữ nhiệt khắc logo và túi vải canvas cho sự kiện cuối năm. Nhờ EcoMart gửi báo giá chi tiết.")
                            .status(ContactStatus.NEW)
                            .createdAt(LocalDateTime.now().minusDays(1))
                            .build(),
                    ContactMessage.builder()
                            .fullName("Lê Hoàng Nam")
                            .email("nam.le@gmail.com")
                            .phone("0908112233")
                            .subject("Góp ý về vật liệu đóng gói thùng carton")
                            .content("Rất hài lòng với sản phẩm xà phòng than tre. Đóng gói rất kỹ và không dùng bọc ni-lông bóng khí, đúng chuẩn tinh thần bảo vệ môi trường!")
                            .status(ContactStatus.RESOLVED)
                            .createdAt(LocalDateTime.now().minusDays(3))
                            .resolvedAt(LocalDateTime.now().minusDays(2))
                            .build(),
                    ContactMessage.builder()
                            .fullName("Phạm Thu Hà")
                            .email("ha.pham@gmail.com")
                            .phone("0934556677")
                            .subject("Yêu cầu bổ sung hóa đơn VAT cho đơn hàng doanh nghiệp")
                            .content("Đã nhận được hàng đúng hẹn. Nhờ ban quản trị xuất hóa đơn điện tử theo thông tin công ty đã ghi chú trong đơn hàng. Cảm ơn!")
                            .status(ContactStatus.RESOLVED)
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .resolvedAt(LocalDateTime.now().minusDays(4))
                            .build()
            );

            contactMessageRepository.saveAll(messages);
        }

        log.info("Khởi tạo dữ liệu mẫu EcoMart (10 Sản Phẩm, 5 Danh Mục, 5 Thương Hiệu, 6 Chứng Nhận Xanh, 4 Tin Nhắn) THÀNH CÔNG!");
    }

    private void createDemoProductIfAbsent(
            String name,
            String description,
            BigDecimal price,
            BigDecimal originalPrice,
            int ecoScore,
            String materialInfo,
            Category category,
            Brand brand,
            List<Certification> certifications,
            List<String> imageUrls,
            int stockQuantity
    ) {
        if (productRepository.existsByName(name)) {
            return;
        }

        Product product = Product.builder()
                .name(name)
                .description(description)
                .sellingPrice(price)
                .originalPrice(originalPrice)
                .ecoScore(ecoScore)
                .materialInfo(materialInfo)
                .category(category)
                .brand(brand)
                .certifications(new HashSet<>(certifications))
                .isVisible(true)
                .build();

        Product savedProduct = productRepository.save(product);

        // Save images
        int order = 1;
        for (String url : imageUrls) {
            ProductImage img = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(url)
                    .isPrimary(order == 1)
                    .displayOrder(order++)
                    .build();
            productImageRepository.save(img);
        }

        // Save inventory
        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .quantity(stockQuantity)
                .build();
        inventoryRepository.save(inventory);
    }
}
