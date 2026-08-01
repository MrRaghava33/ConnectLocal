package com.connectlocal.service;

import com.connectlocal.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {

    ReviewDTO createReview(ReviewDTO reviewDTO, Long seekerId);

    List<ReviewDTO> getReviewsByProvider(Long providerId);
}
