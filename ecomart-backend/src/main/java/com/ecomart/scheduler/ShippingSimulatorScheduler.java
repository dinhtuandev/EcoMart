package com.ecomart.scheduler;

import com.ecomart.dto.response.ShippingOrderResponse;
import com.ecomart.service.ShippingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShippingSimulatorScheduler {

    private final ShippingService shippingService;

    @Value("${app.shipping.simulation.enabled:true}")
    private boolean simulationEnabled;

    /**
     * Chạy định kỳ mỗi phút (mặc định 60.000 ms) để quét và đẩy tiến trình các đơn giao hàng và thu hồi
     */
    @Scheduled(fixedDelayString = "${app.shipping.simulation.interval-ms:60000}", initialDelay = 15000)
    public void runShippingSimulation() {
        if (!simulationEnabled) {
            return;
        }

        try {
            List<ShippingOrderResponse> advancedOrders = shippingService.advanceAllActiveShipments();
            if (!advancedOrders.isEmpty()) {
                log.info("[Shipping Simulator] Đã tự động cập nhật tiến trình cho {} vận đơn đang hoạt động.", advancedOrders.size());
            }
        } catch (Exception e) {
            log.error("[Shipping Simulator] Lỗi khi chạy tác vụ mô phỏng vận chuyển: {}", e.getMessage(), e);
        }
    }
}
