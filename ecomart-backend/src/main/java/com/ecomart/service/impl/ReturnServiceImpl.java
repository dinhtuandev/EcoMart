package com.ecomart.service.impl;

import com.ecomart.dto.request.AdminApproveReturnRequest;
import com.ecomart.dto.request.AdminQCInspectionRequest;
import com.ecomart.dto.request.AdminRejectReturnRequest;
import com.ecomart.dto.request.CreateReturnRequest;
import com.ecomart.dto.request.ReturnItemRequest;
import com.ecomart.dto.response.*;
import com.ecomart.entity.*;
import com.ecomart.entity.enums.*;
import com.ecomart.exception.BadRequestException;
import com.ecomart.exception.ConflictException;
import com.ecomart.exception.ForbiddenException;
import com.ecomart.exception.ResourceNotFoundException;
import com.ecomart.repository.*;
import com.ecomart.service.EmailService;
import com.ecomart.service.PolicyService;
import com.ecomart.service.ReturnService;
import com.ecomart.service.ShippingService;
import lombok.RequiredArgsConstructor;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final ReturnRequestItemRepository returnRequestItemRepository;
    private final ReturnRequestEvidenceRepository returnRequestEvidenceRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final InventoryRepository inventoryRepository;
    private final ShippingOrderRepository shippingOrderRepository;
    private final PolicyService policyService;
    private final ShippingService shippingService;
    private final EmailService emailService;

    private static final List<String> STANDARD_REASONS = List.of(
            "Sản phẩm bị lỗi kỹ thuật, không hoạt động",
            "Sản phẩm bị hư hỏng, bể vỡ trong quá trình vận chuyển",
            "Giao sai sản phẩm (sai màu sắc, kích cỡ, chủng loại)",
            "Sản phẩm không đúng với mô tả trên website",
            "Sản phẩm hết hạn sử dụng hoặc bao bì không còn nguyên vẹn",
            "Khác (vui lòng ghi chú chi tiết)"
    );

    @Override
    @Transactional(readOnly = true)
    public ReturnEligibilityResponse checkReturnEligibility(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với ID: " + orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền xem thông tin đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            return ReturnEligibilityResponse.builder()
                    .orderId(order.getId())
                    .orderCode(order.getOrderCode())
                    .orderCompletedAt(order.getCompletedAt())
                    .isEligibleForAny(false)
                    .items(Collections.emptyList())
                    .standardReasons(STANDARD_REASONS)
                    .build();
        }

        LocalDateTime completedAt = order.getCompletedAt() != null ? order.getCompletedAt() : LocalDateTime.now();
        List<ReturnItemEligibilityResponse> itemResponses = new ArrayList<>();
        boolean eligibleForAny = false;

        for (OrderItem item : order.getItems()) {
            Policy returnPolicy = policyService.resolvePolicy(
                    item.getProduct().getId(),
                    item.getProduct().getCategory() != null ? item.getProduct().getCategory().getId() : null,
                    PolicyType.RETURN
            );

            Policy warrantyPolicy = policyService.resolvePolicy(
                    item.getProduct().getId(),
                    item.getProduct().getCategory() != null ? item.getProduct().getCategory().getId() : null,
                    PolicyType.WARRANTY
            );

            LocalDateTime returnEligibleUntil = item.getReturnEligibleUntil() != null
                    ? item.getReturnEligibleUntil()
                    : completedAt.plusDays(returnPolicy.getDurationDays());

            LocalDateTime warrantyEligibleUntil = item.getWarrantyEligibleUntil() != null
                    ? item.getWarrantyEligibleUntil()
                    : completedAt.plusDays(warrantyPolicy.getDurationDays());

            // Calculate active returned quantity for this order item
            List<ReturnRequestItem> existingReturnItems = returnRequestItemRepository.findByOrderItemId(item.getId());
            int activeReturnedQty = existingReturnItems.stream()
                    .filter(ri -> ri.getReturnRequest().getStatus() != ReturnRequestStatus.REJECTED &&
                                  ri.getReturnRequest().getStatus() != ReturnRequestStatus.CANCELLED &&
                                  ri.getReturnRequest().getStatus() != ReturnRequestStatus.QC_FAILED)
                    .mapToInt(ReturnRequestItem::getQuantity)
                    .sum();

            int availableReturnQty = Math.max(0, item.getQuantity() - activeReturnedQty);

            boolean isReturnEligible = availableReturnQty > 0 && LocalDateTime.now().isBefore(returnEligibleUntil);
            boolean isWarrantyEligible = availableReturnQty > 0 && LocalDateTime.now().isBefore(warrantyEligibleUntil);

            if (isReturnEligible || isWarrantyEligible) {
                eligibleForAny = true;
            }

            String primaryImageUrl = getPrimaryImageUrl(item.getProduct());

            itemResponses.add(ReturnItemEligibilityResponse.builder()
                    .orderItemId(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProductName())
                    .productImageUrl(primaryImageUrl)
                    .unitPrice(item.getUnitPrice())
                    .purchasedQuantity(item.getQuantity())
                    .availableReturnQuantity(availableReturnQty)
                    .returnEligibleUntil(returnEligibleUntil)
                    .isReturnEligible(isReturnEligible)
                    .warrantyEligibleUntil(warrantyEligibleUntil)
                    .isWarrantyEligible(isWarrantyEligible)
                    .returnPolicyName(returnPolicy.getName())
                    .warrantyPolicyName(warrantyPolicy.getName())
                    .conditions(returnPolicy.getConditionsDescription())
                    .build());
        }

        return ReturnEligibilityResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .orderCompletedAt(order.getCompletedAt())
                .isEligibleForAny(eligibleForAny)
                .items(itemResponses)
                .standardReasons(STANDARD_REASONS)
                .build();
    }

    @Override
    @Transactional
    public ReturnRequestResponse createReturnRequest(Long userId, CreateReturnRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại với ID: " + request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền thực hiện yêu cầu đổi trả cho đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Chỉ có thể yêu cầu đổi trả/bảo hành cho đơn hàng đã Hoàn thành (COMPLETED)");
        }

        LocalDateTime completedAt = order.getCompletedAt() != null ? order.getCompletedAt() : LocalDateTime.now();
        BigDecimal totalRefundAmount = BigDecimal.ZERO;
        List<ReturnRequestItem> returnItemsToSave = new ArrayList<>();

        for (ReturnItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = orderItemRepository.findById(itemReq.getOrderItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Món hàng không tồn tại trong đơn: " + itemReq.getOrderItemId()));

            if (!orderItem.getOrder().getId().equals(order.getId())) {
                throw new BadRequestException("Món hàng #" + itemReq.getOrderItemId() + " không thuộc đơn hàng #" + order.getId());
            }

            // Check active returned quantity
            List<ReturnRequestItem> existingReturnItems = returnRequestItemRepository.findByOrderItemId(orderItem.getId());
            int activeReturnedQty = existingReturnItems.stream()
                    .filter(ri -> ri.getReturnRequest().getStatus() != ReturnRequestStatus.REJECTED &&
                                  ri.getReturnRequest().getStatus() != ReturnRequestStatus.CANCELLED &&
                                  ri.getReturnRequest().getStatus() != ReturnRequestStatus.QC_FAILED)
                    .mapToInt(ReturnRequestItem::getQuantity)
                    .sum();

            int availableReturnQty = orderItem.getQuantity() - activeReturnedQty;
            if (itemReq.getQuantity() > availableReturnQty) {
                throw new BadRequestException("Số lượng yêu cầu (" + itemReq.getQuantity() +
                        ") vượt quá số lượng còn được đổi trả (" + availableReturnQty + ") của sản phẩm: " + orderItem.getProductName());
            }

            // Check policy deadline
            PolicyType targetPolicyType = (request.getRequestType() == ReturnRequestType.WARRANTY)
                    ? PolicyType.WARRANTY
                    : PolicyType.RETURN;

            Policy policy = policyService.resolvePolicy(
                    orderItem.getProduct().getId(),
                    orderItem.getProduct().getCategory() != null ? orderItem.getProduct().getCategory().getId() : null,
                    targetPolicyType
            );

            LocalDateTime eligibleUntil = (targetPolicyType == PolicyType.RETURN)
                    ? (orderItem.getReturnEligibleUntil() != null ? orderItem.getReturnEligibleUntil() : completedAt.plusDays(policy.getDurationDays()))
                    : (orderItem.getWarrantyEligibleUntil() != null ? orderItem.getWarrantyEligibleUntil() : completedAt.plusDays(policy.getDurationDays()));

            if (LocalDateTime.now().isAfter(eligibleUntil)) {
                throw new BadRequestException("Sản phẩm '" + orderItem.getProductName() + "' đã hết hạn " +
                        (targetPolicyType == PolicyType.RETURN ? "đổi trả" : "bảo hành") + " vào ngày " + eligibleUntil);
            }

            BigDecimal itemTotal = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalRefundAmount = totalRefundAmount.add(itemTotal);

            ReturnRequestItem rri = ReturnRequestItem.builder()
                    .orderItem(orderItem)
                    .product(orderItem.getProduct())
                    .productName(orderItem.getProductName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(orderItem.getUnitPrice())
                    .build();
            returnItemsToSave.add(rri);

            orderItem.setReturnStatus("REQUESTED");
            orderItemRepository.save(orderItem);
        }

        String requestCode = "RET-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();

        String pickupAddr = request.getPickupAddress() != null && !request.getPickupAddress().isBlank()
                ? request.getPickupAddress()
                : order.getDeliveryAddress();

        String contactName = request.getPickupContactName() != null && !request.getPickupContactName().isBlank()
                ? request.getPickupContactName()
                : order.getRecipientName();

        String contactPhone = request.getPickupContactPhone() != null && !request.getPickupContactPhone().isBlank()
                ? request.getPickupContactPhone()
                : order.getRecipientPhone();

        ReturnRequest returnRequest = ReturnRequest.builder()
                .requestCode(requestCode)
                .user(user)
                .order(order)
                .requestType(request.getRequestType())
                .status(ReturnRequestStatus.PENDING)
                .reason(request.getReason())
                .customerNote(request.getCustomerNote())
                .refundAmount(request.getRequestType() == ReturnRequestType.RETURN_REFUND ? totalRefundAmount : BigDecimal.ZERO)
                .pickupAddress(pickupAddr)
                .pickupContactName(contactName)
                .pickupContactPhone(contactPhone)
                .build();

        ReturnRequest savedRequest = returnRequestRepository.save(returnRequest);

        for (ReturnRequestItem rri : returnItemsToSave) {
            rri.setReturnRequest(savedRequest);
            returnRequestItemRepository.save(rri);
            savedRequest.getItems().add(rri);
        }

        if (request.getEvidenceUrls() != null) {
            for (String url : request.getEvidenceUrls()) {
                ReturnRequestEvidence evidence = ReturnRequestEvidence.builder()
                        .returnRequest(savedRequest)
                        .mediaUrl(url)
                        .mediaType(url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".mov") ? "VIDEO" : "IMAGE")
                        .build();
                returnRequestEvidenceRepository.save(evidence);
                savedRequest.getEvidences().add(evidence);
            }
        }

        // Send email notification
        emailService.sendReturnRequestCreated(user.getEmail(), user.getFullName(), savedRequest.getRequestCode(), order.getOrderCode());

        return mapToReturnRequestResponse(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getCustomerReturnRequests(Long userId, ReturnRequestStatus status, int page, int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ReturnRequest> requestPage;

        if (status != null) {
            requestPage = returnRequestRepository.findAllByUserIdAndStatus(userId, status, pageable);
        } else {
            requestPage = returnRequestRepository.findAllByUserId(userId, pageable);
        }

        List<ReturnRequestResponse> content = requestPage.getContent().stream()
                .map(this::mapToReturnRequestResponse)
                .toList();

        return PageResponse.from(content, requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestResponse getCustomerReturnRequestDetail(Long userId, Long requestId) {
        ReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));

        if (!request.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền xem yêu cầu đổi trả này");
        }

        return mapToReturnRequestResponse(request);
    }

    @Override
    @Transactional
    public ReturnRequestResponse cancelReturnRequest(Long userId, Long requestId) {
        ReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));

        if (!request.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Bạn không có quyền hủy yêu cầu đổi trả này");
        }

        if (request.getStatus() != ReturnRequestStatus.PENDING) {
            throw new ConflictException("Chỉ có thể hủy yêu cầu đang ở trạng thái Chờ duyệt (PENDING)");
        }

        request.setStatus(ReturnRequestStatus.CANCELLED);
        ReturnRequest saved = returnRequestRepository.save(request);

        // Reset order item return status
        for (ReturnRequestItem rri : saved.getItems()) {
            OrderItem oi = rri.getOrderItem();
            oi.setReturnStatus("NONE");
            orderItemRepository.save(oi);
        }

        return mapToReturnRequestResponse(saved);
    }

    // ==========================================
    // MANAGER / ADMIN OPERATIONS
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReturnRequestResponse> getAdminReturnRequests(
            ReturnRequestStatus status,
            ReturnRequestType type,
            String keyword,
            int page,
            int pageSize
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<ReturnRequest> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestType"), type));
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("requestCode")), kw),
                    cb.like(cb.lower(root.get("order").get("orderCode")), kw),
                    cb.like(cb.lower(root.get("user").get("fullName")), kw),
                    cb.like(cb.lower(root.get("pickupContactPhone")), kw)
            ));
        }

        Page<ReturnRequest> requestPage = returnRequestRepository.findAll(spec, pageable);
        List<ReturnRequestResponse> content = requestPage.getContent().stream()
                .map(this::mapToReturnRequestResponse)
                .toList();

        return PageResponse.from(content, requestPage);
    }

    @Override
    @Transactional(readOnly = true)
    public ReturnRequestResponse getAdminReturnRequestDetail(Long requestId) {
        ReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));
        return mapToReturnRequestResponse(request);
    }

    @Override
    @Transactional
    public ReturnRequestResponse approveReturnRequest(Long requestId, AdminApproveReturnRequest adminRequest) {
        ReturnRequest returnRequest = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));

        if (returnRequest.getStatus() != ReturnRequestStatus.PENDING) {
            throw new ConflictException("Chỉ có thể duyệt yêu cầu đang ở trạng thái Chờ duyệt (PENDING)");
        }

        returnRequest.setStatus(ReturnRequestStatus.APPROVED);
        returnRequest.setApprovedAt(LocalDateTime.now());
        if (adminRequest != null && adminRequest.getAdminNote() != null) {
            returnRequest.setAdminNote(adminRequest.getAdminNote());
        }

        ReturnRequest saved = returnRequestRepository.save(returnRequest);

        // Automatically create REVERSE shipping order
        ShippingOrderResponse shipping = shippingService.createReverseShipping(saved);

        // Update items status to RETURNING
        for (ReturnRequestItem rri : saved.getItems()) {
            OrderItem oi = rri.getOrderItem();
            oi.setReturnStatus("RETURNING");
            orderItemRepository.save(oi);
        }

        // Send email to customer
        emailService.sendReturnRequestApproved(
                saved.getUser().getEmail(),
                saved.getUser().getFullName(),
                saved.getRequestCode(),
                shipping.getTrackingNumber()
        );

        return mapToReturnRequestResponse(saved);
    }

    @Override
    @Transactional
    public ReturnRequestResponse rejectReturnRequest(Long requestId, AdminRejectReturnRequest adminRequest) {
        ReturnRequest returnRequest = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));

        if (returnRequest.getStatus() != ReturnRequestStatus.PENDING) {
            throw new ConflictException("Chỉ có thể từ chối yêu cầu đang ở trạng thái Chờ duyệt (PENDING)");
        }

        returnRequest.setStatus(ReturnRequestStatus.REJECTED);
        returnRequest.setRejectionReason(adminRequest.getRejectionReason());

        ReturnRequest saved = returnRequestRepository.save(returnRequest);

        // Reset items status
        for (ReturnRequestItem rri : saved.getItems()) {
            OrderItem oi = rri.getOrderItem();
            oi.setReturnStatus("NONE");
            orderItemRepository.save(oi);
        }

        // Send email to customer
        emailService.sendReturnRequestRejected(
                saved.getUser().getEmail(),
                saved.getUser().getFullName(),
                saved.getRequestCode(),
                adminRequest.getRejectionReason()
        );

        return mapToReturnRequestResponse(saved);
    }

    @Override
    @Transactional
    public ReturnRequestResponse processQCInspection(Long requestId, AdminQCInspectionRequest adminRequest) {
        ReturnRequest returnRequest = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu đổi trả không tồn tại với ID: " + requestId));

        if (returnRequest.getStatus() == ReturnRequestStatus.COMPLETED ||
            returnRequest.getStatus() == ReturnRequestStatus.REJECTED ||
            returnRequest.getStatus() == ReturnRequestStatus.CANCELLED) {
            throw new ConflictException("Không thể kiểm định QC cho yêu cầu ở trạng thái: " + returnRequest.getStatus());
        }

        returnRequest.setQcPassed(adminRequest.getQcPassed());
        returnRequest.setQcNotes(adminRequest.getQcNotes());

        ReturnRequestType action = adminRequest.getAction() != null ? adminRequest.getAction() : returnRequest.getRequestType();

        if (!adminRequest.getQcPassed()) {
            returnRequest.setStatus(ReturnRequestStatus.QC_FAILED);
            ReturnRequest saved = returnRequestRepository.save(returnRequest);

            // Notify customer of failed QC
            emailService.sendReturnQCResult(
                    saved.getUser().getEmail(),
                    saved.getUser().getFullName(),
                    saved.getRequestCode(),
                    false,
                    "TRẢ LẠI HÀNG CHO KHÁCH",
                    adminRequest.getQcNotes()
            );

            return mapToReturnRequestResponse(saved);
        }

        // QC Passed
        returnRequest.setStatus(ReturnRequestStatus.COMPLETED);
        returnRequest.setCompletedAt(LocalDateTime.now());

        if (action == ReturnRequestType.RETURN_REFUND) {
            // Restore inventory stock
            for (ReturnRequestItem rri : returnRequest.getItems()) {
                inventoryRepository.incrementStock(rri.getProduct().getId(), rri.getQuantity());
                OrderItem oi = rri.getOrderItem();
                oi.setReturnStatus("RETURNED");
                orderItemRepository.save(oi);
            }

            // Update order payment status if fully refunded
            Order order = returnRequest.getOrder();
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
                orderRepository.save(order);
            }

            emailService.sendReturnQCResult(
                    returnRequest.getUser().getEmail(),
                    returnRequest.getUser().getFullName(),
                    returnRequest.getRequestCode(),
                    true,
                    "HOÀN TIỀN (" + returnRequest.getRefundAmount() + " VNĐ)",
                    adminRequest.getQcNotes()
            );
        } else if (action == ReturnRequestType.RETURN_EXCHANGE) {
            for (ReturnRequestItem rri : returnRequest.getItems()) {
                OrderItem oi = rri.getOrderItem();
                oi.setReturnStatus("EXCHANGED");
                orderItemRepository.save(oi);
            }

            emailService.sendReturnQCResult(
                    returnRequest.getUser().getEmail(),
                    returnRequest.getUser().getFullName(),
                    returnRequest.getRequestCode(),
                    true,
                    "ĐỔI SẢN PHẨM MỚI",
                    adminRequest.getQcNotes()
            );
        } else { // WARRANTY
            for (ReturnRequestItem rri : returnRequest.getItems()) {
                OrderItem oi = rri.getOrderItem();
                oi.setReturnStatus("WARRANTIED");
                orderItemRepository.save(oi);
            }

            emailService.sendReturnQCResult(
                    returnRequest.getUser().getEmail(),
                    returnRequest.getUser().getFullName(),
                    returnRequest.getRequestCode(),
                    true,
                    "TIẾP NHẬN BẢO HÀNH CHÍNH HÃNG",
                    adminRequest.getQcNotes()
            );
        }

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        return mapToReturnRequestResponse(saved);
    }

    private ReturnRequestResponse mapToReturnRequestResponse(ReturnRequest request) {
        List<ReturnRequestItemResponse> itemResponses = new ArrayList<>();
        if (request.getItems() != null) {
            itemResponses = request.getItems().stream()
                    .map(item -> ReturnRequestItemResponse.builder()
                            .id(item.getId())
                            .orderItemId(item.getOrderItem().getId())
                            .productId(item.getProduct().getId())
                            .productName(item.getProductName())
                            .productImageUrl(getPrimaryImageUrl(item.getProduct()))
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .lineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build())
                    .toList();
        }

        List<ReturnRequestEvidenceResponse> evidenceResponses = new ArrayList<>();
        if (request.getEvidences() != null) {
            evidenceResponses = request.getEvidences().stream()
                    .map(e -> ReturnRequestEvidenceResponse.builder()
                            .id(e.getId())
                            .mediaUrl(e.getMediaUrl())
                            .mediaType(e.getMediaType())
                            .createdAt(e.getCreatedAt())
                            .build())
                    .toList();
        }

        ShippingOrderResponse shippingResponse = null;
        Optional<ShippingOrder> reverseShipping = shippingOrderRepository.findByReturnRequestId(request.getId());
        if (reverseShipping.isPresent()) {
            shippingResponse = shippingService.trackShipping(reverseShipping.get().getTrackingNumber());
        }

        return ReturnRequestResponse.builder()
                .id(request.getId())
                .requestCode(request.getRequestCode())
                .orderId(request.getOrder().getId())
                .orderCode(request.getOrder().getOrderCode())
                .userId(request.getUser().getId())
                .customerName(request.getUser().getFullName())
                .customerEmail(request.getUser().getEmail())
                .customerPhone(request.getUser().getPhoneNumber())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .reason(request.getReason())
                .customerNote(request.getCustomerNote())
                .refundAmount(request.getRefundAmount())
                .pickupAddress(request.getPickupAddress())
                .pickupContactName(request.getPickupContactName())
                .pickupContactPhone(request.getPickupContactPhone())
                .adminNote(request.getAdminNote())
                .rejectionReason(request.getRejectionReason())
                .qcNotes(request.getQcNotes())
                .qcPassed(request.getQcPassed())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .approvedAt(request.getApprovedAt())
                .completedAt(request.getCompletedAt())
                .items(itemResponses)
                .evidences(evidenceResponses)
                .reverseShipping(shippingResponse)
                .build();
    }

    private String getPrimaryImageUrl(Product product) {
        if (product == null || product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }
        return product.getImages().stream()
                .filter(ProductImage::isPrimary)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElseGet(() -> product.getImages().get(0).getImageUrl());
    }
}
