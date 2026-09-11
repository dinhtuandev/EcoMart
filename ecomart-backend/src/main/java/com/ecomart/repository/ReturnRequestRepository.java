package com.ecomart.repository;

import com.ecomart.entity.ReturnRequest;
import com.ecomart.entity.enums.ReturnRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long>, JpaSpecificationExecutor<ReturnRequest> {

    Optional<ReturnRequest> findByRequestCode(String requestCode);

    Page<ReturnRequest> findAllByUserId(Long userId, Pageable pageable);

    Page<ReturnRequest> findAllByUserIdAndStatus(Long userId, ReturnRequestStatus status, Pageable pageable);

    List<ReturnRequest> findByOrderId(Long orderId);

    boolean existsByOrderIdAndStatusNotIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
