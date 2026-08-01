package com.connectlocal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object representing a marketplace Service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be a positive value")
    private Double price;

    @NotBlank(message = "Location is required")
    private String location;

    private String availability;

    private String imageUrl;

    private Long providerId;

    private String providerName;
}
