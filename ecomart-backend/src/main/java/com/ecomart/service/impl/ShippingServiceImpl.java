package com.ecomart.service.impl;

import com.ecomart.dto.request.UpdateShippingStatusRequest;
import com.ecomart.dto.response.PageResponse;
import com.ecomart.dto.response.ShippingLogResponse;
import com.ecomart.dto.response.ShippingOrderResponse;
import com.ecomart.entity.*;
import com.ecomart.entity.enums.*;
import com.ecomart.exception.ResourceNotFoundException;
import com.ecomart.repository.OrderRepository;
import com.ecomart.repository.ReturnRequestRepository;
import com.ecomart.repository.ShippingLogRepository;
import com.ecomart.repository.ShippingOrderRepository;
import com.ecomart.service.PolicyService;
import com.ecomart.service.ShippingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {

    private final ShippingOrderRepository shippingOrderRepository;
    private final ShippingLogRepository shippingLogRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final PolicyService policyService;

    private static final String STORE_NAME = "Kho Tổng EcoMart";
    private static final String STORE_PHONE = "0281234567";
    private static final String STORE_ADDRESS = "12 Đường A, Phường B, Quận C, TP. Hồ Chí Minh";

    @Override
    public BigDecimal calculateShippingFee(String fromProvince, String toProvince, BigDecimal weightKg, ShippingType type) {
        if (fromProvince == null || toProvince == null) {
            return BigDecimal.valueOf(30000);
        }

        String p1 = fromProvince.trim().toLowerCase();
        String p2 = toProvince.trim().toLowerCase();

        BigDecimal baseFee;
        if (p1.contains("hồ chí minh") && p2.contains("hồ chí minh") || p1.contains("hà nội") && p2.contains("hà nội")) {
            baseFee = BigDecimal.valueOf(22000);
        } else if (p1.equals(p2)) {
            baseFee = BigDecimal.valueOf(25000);
        } else {
            baseFee = BigDecimal.valueOf(35000);
        }

        if (weightKg != null && weightKg.compareTo(BigDecimal.valueOf(2)) > 0) {
            BigDecimal extraWeight = weightKg.subtract(BigDecimal.valueOf(2));
            BigDecimal extraFee = extraWeight.multiply(BigDecimal.valueOf(5000));
            baseFee = baseFee.add(extraFee);
        }

        return baseFee;
    }

    @Override
    @Transactional
    public ShippingOrderResponse createForwardShipping(Order order) {
        String trackingNumber = "ECO-SHIP-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        BigDecimal fee = calculateShippingFee("Hồ Chí Minh", order.getDeliveryAddress(), BigDecimal.valueOf(1.0), ShippingType.FORWARD);
        BigDecimal codAmount = order.getPaymentMethod() == PaymentMethod.COD && order.getPaymentStatus() != PaymentStatus.PAID
                ? order.getTotalAmount()
                : BigDecimal.ZERO;

        ShippingOrder shippingOrder = ShippingOrder.builder()
                .trackingNumber(trackingNumber)
                .order(order)
                .shippingType(ShippingType.FORWARD)
                .carrier(ShippingCarrier.ECO_EXPRESS)
                .status(ShippingStatus.READY_TO_PICK)
                .senderName(STORE_NAME)
                .senderPhone(STORE_PHONE)
                .senderAddress(STORE_ADDRESS)
                .receiverName(order.getRecipientName())
                .receiverPhone(order.getRecipientPhone())
                .receiverAddress(order.getDeliveryAddress())
                .shippingFee(fee)
                .feeBearer(FeeBearer.SHOP)
                .codAmount(codAmount)
                .estimatedDeliveryAt(LocalDateTime.now().plusDays(3))
                .build();

        ShippingOrder saved = shippingOrderRepository.save(shippingOrder);

        ShippingLog initialLog = ShippingLog.builder()
                .shippingOrder(saved)
                .status(ShippingStatus.READY_TO_PICK)
                .location("Kho Tổng EcoMart, TP.HCM")
                .note("Đơn hàng đã được tiếp nhận và đóng gói, đang chờ bưu tá đến lấy hàng")
                .build();
        shippingLogRepository.save(initialLog);
        saved.getLogs().add(initialLog);

        return mapToShippingOrderResponse(saved);
    }

    @Override
    @Transactional
    public ShippingOrderResponse createReverseShipping(ReturnRequest returnRequest) {
        String trackingNumber = "ECO-RET-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        BigDecimal fee = calculateShippingFee(returnRequest.getPickupAddress(), "Hồ Chí Minh", BigDecimal.valueOf(1.0), ShippingType.REVERSE);

        ShippingOrder shippingOrder = ShippingOrder.builder()
                .trackingNumber(trackingNumber)
                .order(returnRequest.getOrder())
                .returnRequest(returnRequest)
                .shippingType(ShippingType.REVERSE)
                .carrier(ShippingCarrier.ECO_EXPRESS)
                .status(ShippingStatus.READY_TO_PICK)
                .senderName(returnRequest.getPickupContactName())
                .senderPhone(returnRequest.getPickupContactPhone())
                .senderAddress(returnRequest.getPickupAddress())
                .receiverName(STORE_NAME)
                .receiverPhone(STORE_PHONE)
                .receiverAddress(STORE_ADDRESS)
                .shippingFee(fee)
                .feeBearer(FeeBearer.SHOP)
                .codAmount(BigDecimal.ZERO)
                .estimatedDeliveryAt(LocalDateTime.now().plusDays(3))
                .build();

        ShippingOrder saved = shippingOrderRepository.save(shippingOrder);

        ShippingLog initialLog = ShippingLog.builder()
                .shippingOrder(saved)
                .status(ShippingStatus.READY_TO_PICK)
                .location("Bưu cục phụ trách địa bàn lấy hàng")
                .note("Đã tạo vận đơn thu hồi. Bưu tá EcoMart Express sẽ liên hệ khách hàng để lấy kiện hàng.")
                .build();
        shippingLogRepository.save(initialLog);
        saved.getLogs().add(initialLog);

        return mapToShippingOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ShippingOrderResponse trackShipping(String trackingNumber) {
        ShippingOrder shippingOrder = shippingOrderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Vận đơn không tồn tại với mã: " + trackingNumber));
        return mapToShippingOrderResponse(shippingOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public ShippingOrderResponse getForwardShippingByOrderId(Long orderId) {
        if (orderId == null) return null;
        List<ShippingOrder> shippingOrders = shippingOrderRepository.findByOrderId(orderId);
        return shippingOrders.stream()
                .filter(so -> so.getShippingType() == ShippingType.FORWARD)
                .findFirst()
                .map(this::mapToShippingOrderResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public ShippingOrderResponse updateShippingStatus(String trackingNumber, UpdateShippingStatusRequest request) {
        ShippingOrder shippingOrder = shippingOrderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Vận đơn không tồn tại với mã: " + trackingNumber));

        shippingOrder.setStatus(request.getStatus());
        if (request.getStatus() == ShippingStatus.PICKING && shippingOrder.getPickedAt() == null) {
            shippingOrder.setPickedAt(LocalDateTime.now());
        } else if (request.getStatus() == ShippingStatus.ARRIVED_AT_LOCAL_HUB) {
            shippingOrder.setEstimatedDeliveryAt(LocalDateTime.now().plusHours(24));
        } else if (request.getStatus() == ShippingStatus.DELIVERED) {
            shippingOrder.setDeliveredAt(LocalDateTime.now());
        }

        ShippingOrder saved = shippingOrderRepository.save(shippingOrder);

        String location = request.getLocation();
        String note = request.getNote();
        if (location == null || location.isBlank()) {
            location = switch (request.getStatus()) {
                case READY_TO_PICK -> "Kho xuất phát EcoMart";
                case PICKING -> "Điểm tiếp nhận bưu tá Eco Express";
                case DELIVERING -> "Trung tâm luân chuyển hàng hóa";
                case ARRIVED_AT_LOCAL_HUB -> "Bưu cục phát địa phương gần người nhận";
                case DELIVERED -> "Địa chỉ người nhận";
                default -> "Trung tâm điều phối EcoMart";
            };
        }
        if (note == null || note.isBlank()) {
            note = switch (request.getStatus()) {
                case READY_TO_PICK -> "Đơn hàng đang chờ bưu tá đến lấy";
                case PICKING -> "Bưu tá đã lấy hàng và đang chuyển về trung tâm phân loại";
                case DELIVERING -> "Kiện hàng đang được luân chuyển";
                case ARRIVED_AT_LOCAL_HUB -> "Thông báo: Kiện hàng đã đến bưu cục phát tại địa phương gần bạn. Dự kiến sẽ được giao trong vòng 24 giờ tới.";
                case DELIVERED -> "Giao hàng thành công. Người nhận đã ký nhận kiện hàng.";
                default -> "Cập nhật trạng thái vận đơn thành " + request.getStatus();
            };
        }

        ShippingLog logEntry = ShippingLog.builder()
                .shippingOrder(saved)
                .status(request.getStatus())
                .location(location)
                .note(note)
                .build();
        shippingLogRepository.save(logEntry);
        saved.getLogs().add(logEntry);

        // Sync with Order if FORWARD shipping and status is DELIVERED
        if (saved.getShippingType() == ShippingType.FORWARD && request.getStatus() == ShippingStatus.DELIVERED) {
            syncForwardDelivered(saved);
        }

        // Sync with ReturnRequest if REVERSE shipping
        if (saved.getShippingType() == ShippingType.REVERSE && saved.getReturnRequest() != null) {
            ReturnRequest ret = saved.getReturnRequest();
            if (request.getStatus() == ShippingStatus.PICKING && ret.getStatus() == ReturnRequestStatus.APPROVED) {
                ret.setStatus(ReturnRequestStatus.PICKING);
                returnRequestRepository.save(ret);
            } else if (request.getStatus() == ShippingStatus.DELIVERING && (ret.getStatus() == ReturnRequestStatus.PICKING || ret.getStatus() == ReturnRequestStatus.APPROVED)) {
                ret.setStatus(ReturnRequestStatus.RETURNING);
                returnRequestRepository.save(ret);
            } else if (request.getStatus() == ShippingStatus.DELIVERED && (ret.getStatus() == ReturnRequestStatus.RETURNING || ret.getStatus() == ReturnRequestStatus.PICKING || ret.getStatus() == ReturnRequestStatus.APPROVED)) {
                ret.setStatus(ReturnRequestStatus.QC_INSPECTING);
                returnRequestRepository.save(ret);
                log.info("Đã tự động chuyển yêu cầu đổi trả {} sang QC_INSPECTING khi kiện hàng hoàn về kho EcoMart.", ret.getRequestCode());
            }
        }

        return mapToShippingOrderResponse(saved);
    }

    private void syncForwardDelivered(ShippingOrder shippingOrder) {
        Order order = shippingOrder.getOrder();
        if (order == null) return;
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.COMPLETED);
            order.setCompletedAt(LocalDateTime.now());

            if (order.getPaymentMethod() == PaymentMethod.COD) {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setPaidAt(LocalDateTime.now());
            }

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Long productId = item.getProduct() != null ? item.getProduct().getId() : null;
                    Long categoryId = (item.getProduct() != null && item.getProduct().getCategory() != null)
                            ? item.getProduct().getCategory().getId()
                            : null;

                    Policy returnPolicy = policyService != null ? policyService.resolvePolicy(productId, categoryId, PolicyType.RETURN) : null;
                    Policy warrantyPolicy = policyService != null ? policyService.resolvePolicy(productId, categoryId, PolicyType.WARRANTY) : null;

                    int returnDays = returnPolicy != null ? returnPolicy.getDurationDays() : 7;
                    int warrantyDays = warrantyPolicy != null ? warrantyPolicy.getDurationDays() : 180;

                    item.setReturnEligibleUntil(order.getCompletedAt().plusDays(returnDays));
                    item.setWarrantyEligibleUntil(order.getCompletedAt().plusDays(warrantyDays));
                    item.setReturnStatus("NONE");
                }
            }
            orderRepository.save(order);
            log.info("Đã tự động hoàn thành đơn hàng {} khi vận đơn {} giao thành công.", order.getOrderCode(), shippingOrder.getTrackingNumber());
        }
    }

    @Override
    @Transactional
    public ShippingOrderResponse advanceSimulationStep(String trackingNumber) {
        ShippingOrder shippingOrder = shippingOrderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Vận đơn không tồn tại với mã: " + trackingNumber));

        ShippingStatus currentStatus = shippingOrder.getStatus();
        ShippingStatus nextStatus;
        String location;
        String note;

        switch (currentStatus) {
            case READY_TO_PICK -> {
                nextStatus = ShippingStatus.PICKING;
                location = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? STORE_NAME
                        : "Địa chỉ người gửi (" + shippingOrder.getSenderName() + ")";
                note = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? "Bưu tá Eco Express đã tiếp nhận và lấy hàng thành công từ kho EcoMart."
                        : "Bưu tá Eco Express đã đến lấy kiện hàng thu hồi từ khách hàng.";
            }
            case PICKING -> {
                nextStatus = ShippingStatus.DELIVERING;
                location = "Trung tâm khai thác luân chuyển EcoMart Express";
                note = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? "Kiện hàng đã xuất kho trung chuyển và đang trên đường luân chuyển tới bưu cục phát."
                        : "Kiện hàng thu hồi đang trên đường vận chuyển về kho tổng EcoMart.";
            }
            case DELIVERING -> {
                nextStatus = ShippingStatus.ARRIVED_AT_LOCAL_HUB;
                location = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? "Bưu cục phát địa phương gần " + shippingOrder.getReceiverName()
                        : "Bưu cục trung chuyển EcoMart Express TP.HCM";
                note = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? "Thông báo: Kiện hàng đã đến bưu cục phát tại địa phương gần bạn. Dự kiến sẽ được giao trong vòng 24 giờ tới."
                        : "Thông báo: Kiện hàng thu hồi đã đến bưu cục trung chuyển, chuẩn bị bàn giao kho trong vòng 24 giờ tới.";
            }
            case ARRIVED_AT_LOCAL_HUB -> {
                nextStatus = ShippingStatus.DELIVERED;
                location = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? shippingOrder.getReceiverAddress()
                        : STORE_ADDRESS;
                note = shippingOrder.getShippingType() == ShippingType.FORWARD
                        ? "Giao hàng thành công. Người nhận " + shippingOrder.getReceiverName() + " đã ký nhận kiện hàng."
                        : "Kiện hàng thu hồi đã về tới kho EcoMart an toàn. Bàn giao bộ phận Kỹ thuật kiểm định QC.";
            }
            default -> {
                return mapToShippingOrderResponse(shippingOrder);
            }
        }

        UpdateShippingStatusRequest updateRequest = UpdateShippingStatusRequest.builder()
                .status(nextStatus)
                .location(location)
                .note(note)
                .build();

        return updateShippingStatus(trackingNumber, updateRequest);
    }

    @Override
    @Transactional
    public List<ShippingOrderResponse> advanceAllActiveShipments() {
        List<ShippingStatus> activeStatuses = List.of(
                ShippingStatus.READY_TO_PICK,
                ShippingStatus.PICKING,
                ShippingStatus.DELIVERING,
                ShippingStatus.ARRIVED_AT_LOCAL_HUB
        );

        List<ShippingOrder> activeOrders = shippingOrderRepository.findByStatusInOrderByUpdatedAtAsc(activeStatuses);
        List<ShippingOrderResponse> results = new ArrayList<>();

        for (ShippingOrder order : activeOrders) {
            try {
                ShippingOrderResponse updated = advanceSimulationStep(order.getTrackingNumber());
                results.add(updated);
            } catch (Exception e) {
                log.error("Lỗi khi mô phỏng tiến trình cho vận đơn {}: {}", order.getTrackingNumber(), e.getMessage());
            }
        }

        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShippingOrderResponse> getAdminShippingOrders(
            ShippingType type,
            ShippingStatus status,
            ShippingCarrier carrier,
            int page,
            int pageSize
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<ShippingOrder> spec = Specification.where(null);

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("shippingType"), type));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (carrier != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("carrier"), carrier));
        }

        Page<ShippingOrder> pageResult = shippingOrderRepository.findAll(spec, pageable);
        List<ShippingOrderResponse> content = pageResult.getContent().stream()
                .map(this::mapToShippingOrderResponse)
                .toList();

        return PageResponse.from(content, pageResult);
    }

    private ShippingOrderResponse mapToShippingOrderResponse(ShippingOrder order) {
        List<ShippingLogResponse> logResponses = new ArrayList<>();
        if (order.getLogs() != null) {
            logResponses = order.getLogs().stream()
                    .map(l -> ShippingLogResponse.builder()
                            .id(l.getId())
                            .status(l.getStatus())
                            .location(l.getLocation())
                            .note(l.getNote())
                            .timestamp(l.getTimestamp())
                            .build())
                    .toList();
        }

        return ShippingOrderResponse.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .orderId(order.getOrder() != null ? order.getOrder().getId() : null)
                .orderCode(order.getOrder() != null ? order.getOrder().getOrderCode() : null)
                .returnRequestId(order.getReturnRequest() != null ? order.getReturnRequest().getId() : null)
                .returnRequestCode(order.getReturnRequest() != null ? order.getReturnRequest().getRequestCode() : null)
                .shippingType(order.getShippingType())
                .carrier(order.getCarrier())
                .status(order.getStatus())
                .senderName(order.getSenderName())
                .senderPhone(order.getSenderPhone())
                .senderAddress(order.getSenderAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress())
                .shippingFee(order.getShippingFee())
                .feeBearer(order.getFeeBearer())
                .codAmount(order.getCodAmount())
                .estimatedDeliveryAt(order.getEstimatedDeliveryAt())
                .pickedAt(order.getPickedAt())
                .deliveredAt(order.getDeliveredAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .logs(logResponses)
                .build();
    }
}
