package com.connectlocal.controller;

import com.connectlocal.dto.ReviewDTO;
import com.connectlocal.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Seekers leave a rating + review for a completed booking; anyone can view
 * a provider's public reviews.
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody ReviewDTO reviewDTO,
                                                    @RequestParam Long seekerId) {
        ReviewDTO created = reviewService.createReview(reviewDTO, seekerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getReviewsByProvider(providerId));
    }
}
