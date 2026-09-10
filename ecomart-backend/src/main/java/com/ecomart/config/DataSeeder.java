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
    }
}
