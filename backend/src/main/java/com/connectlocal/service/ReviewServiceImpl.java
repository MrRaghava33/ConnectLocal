package com.connectlocal.service;

import com.connectlocal.dto.ReviewDTO;
import com.connectlocal.entity.Booking;
import com.connectlocal.entity.Review;
import com.connectlocal.entity.User;
import com.connectlocal.exception.ResourceNotFoundException;
import com.connectlocal.repository.BookingRepository;
import com.connectlocal.repository.ReviewRepository;
import com.connectlocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewDTO createReview(ReviewDTO reviewDTO, Long seekerId) {
        Booking booking = bookingRepository.findById(reviewDTO.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + reviewDTO.getBookingId()));

        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seeker not found with id: " + seekerId));

        Review review = Review.builder()
                .booking(booking)
                .provider(booking.getProvider())
                .seeker(seeker)
                .rating(reviewDTO.getRating())
                .comment(reviewDTO.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);
        return toDTO(savedReview);
    }

    @Override
    public List<ReviewDTO> getReviewsByProvider(Long providerId) {
        return reviewRepository.findByProviderId(providerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO toDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .providerId(review.getProvider().getId())
                .providerName(review.getProvider().getFullName())
                .seekerId(review.getSeeker().getId())
                .seekerName(review.getSeeker().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
