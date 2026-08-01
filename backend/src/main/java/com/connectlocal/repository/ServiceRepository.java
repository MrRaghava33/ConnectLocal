package com.connectlocal.repository;

import com.connectlocal.entity.Service;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    /** Load the provider with every service so DTO conversion does not access a closed lazy session. */
    @EntityGraph(attributePaths = "provider")
    List<Service> findAll();

    @EntityGraph(attributePaths = "provider")
    Optional<Service> findById(Long id);

    @EntityGraph(attributePaths = "provider")
    List<Service> findByProviderId(Long providerId);

    @EntityGraph(attributePaths = "provider")
    List<Service> findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrLocationContainingIgnoreCase(
            String title, String category, String location);
}
