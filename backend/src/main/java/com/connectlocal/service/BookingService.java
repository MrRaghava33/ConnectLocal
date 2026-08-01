package com.connectlocal.service;

import com.connectlocal.dto.BookingDTO;

import java.util.List;

public interface BookingService {

    BookingDTO createBooking(BookingDTO bookingDTO, Long seekerId);

    List<BookingDTO> getAllBookings();

    BookingDTO getBookingById(Long id);

    BookingDTO updateBookingStatus(Long id, String status);

    void cancelBooking(Long id);

    List<BookingDTO> getBookingsBySeeker(Long seekerId);

    List<BookingDTO> getBookingsByProvider(Long providerId);
}
