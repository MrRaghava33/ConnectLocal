package com.connectlocal.service;

import com.connectlocal.dto.BookingDTO;
import com.connectlocal.entity.Booking;
import com.connectlocal.entity.Service;
import com.connectlocal.entity.User;
import com.connectlocal.exception.ResourceNotFoundException;
import com.connectlocal.repository.BookingRepository;
import com.connectlocal.repository.ServiceRepository;
import com.connectlocal.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

// NOTE: fully-qualified @Service annotation used below because this class
// also imports the "Service" entity (com.connectlocal.entity.Service).
@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    @Override
    public BookingDTO createBooking(BookingDTO bookingDTO, Long seekerId) {
        Service service = serviceRepository.findById(bookingDTO.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Service not found with id: " + bookingDTO.getServiceId()));

        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seeker not found with id: " + seekerId));

        Double price = bookingDTO.getPrice() != null ? bookingDTO.getPrice() : service.getPrice();

        Booking booking = Booking.builder()
                .service(service)
                .seeker(seeker)
                .provider(service.getProvider())
                .bookingDate(bookingDTO.getBookingDate())
                .bookingTime(bookingDTO.getBookingTime())
                .notes(bookingDTO.getNotes())
                .price(price)
                .status(Booking.Status.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return toDTO(savedBooking);
    }

    @Override
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return toDTO(booking);
    }

    @Override
    public BookingDTO updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        Booking.Status newStatus;
        try {
            newStatus = Booking.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid booking status: " + status);
        }

        booking.setStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);
        return toDTO(updatedBooking);
    }

    @Override
    public void cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    public List<BookingDTO> getBookingsBySeeker(Long seekerId) {
        return bookingRepository.findBySeekerId(seekerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getBookingsByProvider(Long providerId) {
        return bookingRepository.findByProviderId(providerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private BookingDTO toDTO(Booking booking) {
        Long serviceId = booking.getService() != null ? booking.getService().getId() : null;
        String serviceTitle = booking.getService() != null ? booking.getService().getTitle() : "Service";
        Long seekerId = booking.getSeeker() != null ? booking.getSeeker().getId() : null;
        String seekerName = booking.getSeeker() != null ? booking.getSeeker().getFullName() : "Service Seeker";
        
        User provider = booking.getProvider() != null ? booking.getProvider() : (booking.getService() != null ? booking.getService().getProvider() : null);
        Long providerId = provider != null ? provider.getId() : null;
        String providerName = provider != null ? provider.getFullName() : "Service Provider";

        return BookingDTO.builder()
                .id(booking.getId())
                .serviceId(serviceId)
                .serviceTitle(serviceTitle)
                .seekerId(seekerId)
                .seekerName(seekerName)
                .providerId(providerId)
                .providerName(providerName)
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .notes(booking.getNotes())
                .price(booking.getPrice() != null ? booking.getPrice() : (booking.getService() != null ? booking.getService().getPrice() : 0.0))
                .status(booking.getStatus())
                .build();
    }
}
