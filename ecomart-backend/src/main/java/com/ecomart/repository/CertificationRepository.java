package com.ecomart.repository;

import com.ecomart.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {

    List<Certification> findAllByIsActiveTrueOrderByNameAsc();

    List<Certification> findAllByOrderByNameAsc();

    java.util.Optional<Certification> findByName(String name);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}
