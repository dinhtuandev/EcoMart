package com.ecomart.repository;

import com.ecomart.entity.ReturnRequestEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestEvidenceRepository extends JpaRepository<ReturnRequestEvidence, Long> {

    List<ReturnRequestEvidence> findByReturnRequestId(Long returnRequestId);
}
