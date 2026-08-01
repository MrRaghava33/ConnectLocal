package com.connectlocal.repository;

import com.connectlocal.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"booking", "provider", "seeker"})
    List<Review> findByProviderId(Long providerId);
}
