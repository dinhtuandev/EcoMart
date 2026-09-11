package com.ecomart.config;

import com.ecomart.entity.ContentPage;
import com.ecomart.entity.Role;
import com.ecomart.entity.StoreSetting;
import com.ecomart.repository.ContentPageRepository;
import com.ecomart.repository.RoleRepository;
import com.ecomart.repository.StoreSettingRepository;
import com.ecomart.service.ContentPageService;
import com.ecomart.service.StoreSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final ContentPageRepository contentPageRepository;
    private final StoreSettingRepository storeSettingRepository;
    private final com.ecomart.repository.PolicyRepository policyRepository;

    @Override
    public void run(String... args) {
        initRoles();
        initContentPages();
        initStoreSettings();
        initPolicies();
    }

    private void initPolicies() {
        if (policyRepository.findFirstByProductIdIsNullAndCategoryIdIsNullAndPolicyTypeAndIsActiveTrue(com.ecomart.entity.enums.PolicyType.RETURN).isEmpty()) {
            policyRepository.save(com.ecomart.entity.Policy.builder()
                    .name("Chính sách Đổi trả Toàn sàn")
                    .policyType(com.ecomart.entity.enums.PolicyType.RETURN)
                    .durationDays(7)
                    .shippingFeeBearer(com.ecomart.entity.enums.FeeBearer.SHOP)
                    .conditionsDescription("Hỗ trợ đổi trả miễn phí trong 7 ngày kể từ khi nhận hàng đối với sản phẩm bị lỗi kỹ thuật hoặc giao sai.")
                    .isActive(true)
                    .build());
        }
        if (policyRepository.findFirstByProductIdIsNullAndCategoryIdIsNullAndPolicyTypeAndIsActiveTrue(com.ecomart.entity.enums.PolicyType.WARRANTY).isEmpty()) {
            policyRepository.save(com.ecomart.entity.Policy.builder()
                    .name("Chính sách Bảo hành Toàn sàn")
                    .policyType(com.ecomart.entity.enums.PolicyType.WARRANTY)
                    .durationDays(180)
                    .shippingFeeBearer(com.ecomart.entity.enums.FeeBearer.SHOP)
                    .conditionsDescription("Bảo hành chính hãng 6 tháng cho các lỗi kỹ thuật phát sinh từ nhà sản xuất.")
                    .isActive(true)
                    .build());
        }
    }

    private void initRoles() {
        if (!roleRepository.existsByName(com.ecomart.entity.enums.RoleName.ADMIN.name())) {
            roleRepository.save(Role.builder().name(com.ecomart.entity.enums.RoleName.ADMIN.name()).description("Quản trị viên hệ thống").build());
        }
        if (!roleRepository.existsByName(com.ecomart.entity.enums.RoleName.MANAGER.name())) {
            roleRepository.save(Role.builder().name(com.ecomart.entity.enums.RoleName.MANAGER.name()).description("Quản lý vận hành và kinh doanh").build());
        }
        if (!roleRepository.existsByName(com.ecomart.entity.enums.RoleName.CUSTOMER.name())) {
            roleRepository.save(Role.builder().name(com.ecomart.entity.enums.RoleName.CUSTOMER.name()).description("Khách hàng mua sắm").build());
        }
    }

    private void initContentPages() {
        if (!contentPageRepository.existsBySlug(ContentPageService.RETURN_POLICY)) {
            contentPageRepository.save(ContentPage.builder()
                    .slug(ContentPageService.RETURN_POLICY)
                    .title("Chính sách đổi trả")
                    .content("EcoMart hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm bị lỗi sản xuất hoặc không đúng mô tả.")
                    .build());
        }
        if (!contentPageRepository.existsBySlug(ContentPageService.WARRANTY_POLICY)) {
            contentPageRepository.save(ContentPage.builder()
                    .slug(ContentPageService.WARRANTY_POLICY)
                    .title("Chính sách bảo hành")
                    .content("Các sản phẩm gia dụng và bình giữ nhiệt tại EcoMart được bảo hành chính hãng từ 6 đến 12 tháng tùy theo từng loại sản phẩm.")
                    .build());
        }
        if (!contentPageRepository.existsBySlug(ContentPageService.SHIPPING_POLICY)) {
            contentPageRepository.save(ContentPage.builder()
                    .slug(ContentPageService.SHIPPING_POLICY)
                    .title("Chính sách vận chuyển")
                    .content("EcoMart giao hàng toàn quốc với phương thức đóng gói xanh sử dụng hộp carton tái chế và băng keo sinh học tự phân hủy.")
                    .build());
        }
    }

    private void initStoreSettings() {
        initSingleSetting(StoreSettingService.KEY_STORE_PHONE, "0281234567");
        initSingleSetting(StoreSettingService.KEY_STORE_EMAIL, "contact@ecomart.vn");
        initSingleSetting(StoreSettingService.KEY_STORE_ADDRESS, "12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh");
        initSingleSetting(StoreSettingService.KEY_MAP_EMBED_URL, "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424167520037!2d106.6983483!3d10.7787834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzQzLjYiTiAxMDbCsDQxJzU0LjEiRQ!5e0!3m2!1svi!2s!4v1620000000000!5m2!1svi!2s");
    }

    private void initSingleSetting(String key, String defaultValue) {
        if (!storeSettingRepository.existsById(key)) {
            storeSettingRepository.save(StoreSetting.builder()
                    .settingKey(key)
                    .settingValue(defaultValue)
                    .build());
        }
    }
}
