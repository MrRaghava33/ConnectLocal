package com.connectlocal.repository;

import com.connectlocal.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"service", "seeker", "provider"})
    List<Booking> findAll();

    @EntityGraph(attributePaths = {"service", "seeker", "provider"})
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = {"service", "seeker", "provider"})
    List<Booking> findBySeekerId(Long seekerId);

    @EntityGraph(attributePaths = {"service", "seeker", "provider"})
    List<Booking> findByProviderId(Long providerId);
}
