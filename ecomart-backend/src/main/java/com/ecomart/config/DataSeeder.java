package com.ecomart.config;

import com.ecomart.entity.Role;
import com.ecomart.entity.User;
import com.ecomart.repository.RoleRepository;
import com.ecomart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.ecomart.repository.OrderRepository orderRepository;
    private final com.ecomart.repository.ShippingOrderRepository shippingOrderRepository;
    private final com.ecomart.repository.ShippingLogRepository shippingLogRepository;

    @Override
    public void run(String... args) {
        Role customerRole = roleRepository.findByName(com.ecomart.entity.enums.RoleName.CUSTOMER.name())
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(com.ecomart.entity.enums.RoleName.CUSTOMER.name())
                        .description("Khách hàng của EcoMart")
                        .build()));

        Role managerRole = roleRepository.findByName(com.ecomart.entity.enums.RoleName.MANAGER.name())
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(com.ecomart.entity.enums.RoleName.MANAGER.name())
                        .description("Quản lý vận hành và kinh doanh EcoMart")
                        .build()));

        Role adminRole = roleRepository.findByName(com.ecomart.entity.enums.RoleName.ADMIN.name())
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(com.ecomart.entity.enums.RoleName.ADMIN.name())
                        .description("Quản trị viên hệ thống EcoMart")
                        .build()));

        if (!userRepository.existsByEmail("admin@ecomart.com")) {
            User admin = User.builder()
                    .fullName("Admin EcoMart")
                    .email("admin@ecomart.com")
                    .passwordHash(passwordEncoder.encode("Admin123!"))
                    .phoneNumber("0900000000")
                    .isActive(true)
                    .isEmailVerified(true)
                    .role(adminRole)
                    .build();

            userRepository.save(admin);
            log.info("Khởi tạo tài khoản Admin mặc định thành công: admin@ecomart.com");
        }

        if (!userRepository.existsByEmail("manager@ecomart.com")) {
            User manager = User.builder()
                    .fullName("Manager EcoMart")
                    .email("manager@ecomart.com")
                    .passwordHash(passwordEncoder.encode("Manager123!"))
                    .phoneNumber("0911111111")
                    .isActive(true)
                    .isEmailVerified(true)
                    .role(managerRole)
                    .build();

            userRepository.save(manager);
            log.info("Khởi tạo tài khoản Manager mặc định thành công: manager@ecomart.com");
        }

        if (!userRepository.existsByEmail("customer@ecomart.com")) {
            User customer = User.builder()
                    .fullName("Khách Hàng EcoMart")
                    .email("customer@ecomart.com")
                    .passwordHash(passwordEncoder.encode("Customer123!"))
                    .phoneNumber("0922222222")
                    .isActive(true)
                    .isEmailVerified(true)
                    .role(customerRole)
                    .build();

            userRepository.save(customer);
            log.info("Khởi tạo tài khoản Customer mặc định thành công: customer@ecomart.com");
        }

        // Khởi tạo vận đơn cho các đơn hàng CONFIRMED/COMPLETED chưa có vận đơn
        for (com.ecomart.entity.Order order : orderRepository.findAll()) {
            if (order.getStatus() == com.ecomart.entity.enums.OrderStatus.CONFIRMED || order.getStatus() == com.ecomart.entity.enums.OrderStatus.COMPLETED) {
                if (shippingOrderRepository.findByOrderId(order.getId()).isEmpty()) {
                    String trackingNumber = "ECO-SHIP-" + java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + java.util.UUID.randomUUID().toString().substring(0, 5).toUpperCase();
                    com.ecomart.entity.enums.ShippingStatus initialStatus = order.getStatus() == com.ecomart.entity.enums.OrderStatus.COMPLETED
                            ? com.ecomart.entity.enums.ShippingStatus.DELIVERED
                            : com.ecomart.entity.enums.ShippingStatus.DELIVERING;

                    com.ecomart.entity.ShippingOrder shippingOrder = com.ecomart.entity.ShippingOrder.builder()
                            .trackingNumber(trackingNumber)
                            .order(order)
                            .shippingType(com.ecomart.entity.enums.ShippingType.FORWARD)
                            .carrier(com.ecomart.entity.enums.ShippingCarrier.ECO_EXPRESS)
                            .status(initialStatus)
                            .senderName("Kho Tổng EcoMart")
                            .senderPhone("0281234567")
                            .senderAddress("12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh")
                            .receiverName(order.getRecipientName() != null ? order.getRecipientName() : "Khách Hàng")
                            .receiverPhone(order.getRecipientPhone() != null ? order.getRecipientPhone() : "0901234567")
                            .receiverAddress(order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "TP. Hồ Chí Minh")
                            .shippingFee(java.math.BigDecimal.valueOf(25000))
                            .feeBearer(com.ecomart.entity.enums.FeeBearer.SHOP)
                            .codAmount(java.math.BigDecimal.ZERO)
                            .estimatedDeliveryAt(java.time.LocalDateTime.now().plusDays(2))
                            .pickedAt(java.time.LocalDateTime.now().minusHours(12))
                            .deliveredAt(order.getStatus() == com.ecomart.entity.enums.OrderStatus.COMPLETED ? java.time.LocalDateTime.now() : null)
                            .build();

                    com.ecomart.entity.ShippingOrder saved = shippingOrderRepository.save(shippingOrder);

                    com.ecomart.entity.ShippingLog log1 = com.ecomart.entity.ShippingLog.builder()
                            .shippingOrder(saved)
                            .status(com.ecomart.entity.enums.ShippingStatus.READY_TO_PICK)
                            .location("Kho Tổng EcoMart, TP.HCM")
                            .note("Đơn hàng đã được tiếp nhận và đóng gói sinh thái, sẵn sàng giao cho bưu tá")
                            .build();
                    shippingLogRepository.save(log1);

                    com.ecomart.entity.ShippingLog log2 = com.ecomart.entity.ShippingLog.builder()
                            .shippingOrder(saved)
                            .status(initialStatus)
                            .location(initialStatus == com.ecomart.entity.enums.ShippingStatus.DELIVERED ? "Địa chỉ người nhận" : "Trung tâm luân chuyển hàng hóa Eco Express")
                            .note(initialStatus == com.ecomart.entity.enums.ShippingStatus.DELIVERED ? "Đã giao hàng thành công" : "Kiện hàng đang được luân chuyển an toàn đến bưu cục phát gần bạn")
                            .build();
                    shippingLogRepository.save(log2);

                    log.info("Khởi tạo vận đơn {} cho đơn hàng #{}", trackingNumber, order.getOrderCode());
                }
            }
        }
    }
}
