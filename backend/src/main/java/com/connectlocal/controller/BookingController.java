package com.connectlocal.controller;

import com.connectlocal.dto.BookingDTO;
import com.connectlocal.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Booking lifecycle: seekers create bookings; providers accept/reject/complete them;
 * either side can list bookings; a booking can be cancelled (soft-deleted via status).
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingDTO bookingDTO,
                                                      @RequestParam Long seekerId) {
        BookingDTO created = bookingService.createBooking(bookingDTO, seekerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings(@RequestParam(required = false) Long seekerId,
                                                             @RequestParam(required = false) Long providerId) {
        if (seekerId != null) {
            return ResponseEntity.ok(bookingService.getBookingsBySeeker(seekerId));
        }
        if (providerId != null) {
            return ResponseEntity.ok(bookingService.getBookingsByProvider(providerId));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * Used by providers to ACCEPT / REJECT / COMPLETE a booking,
     * e.g. PUT /api/bookings/5?status=ACCEPTED
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    /**
     * Used by seekers to cancel a booking. Implemented as a soft-delete
     * (status set to CANCELLED) so booking history is preserved.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.noContent().build();
    }
}
