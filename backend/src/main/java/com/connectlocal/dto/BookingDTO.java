package com.connectlocal.dto;

import com.connectlocal.entity.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Data transfer object representing a Booking.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {

    private Long id;

    @NotNull(message = "Service id is required")
    private Long serviceId;

    private String serviceTitle;

    private Long seekerId;
    private String seekerName;

    private Long providerId;
    private String providerName;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Booking time is required")
    private LocalTime bookingTime;

    private Booking.Status status;

    private String notes;
    private Double price;
}
