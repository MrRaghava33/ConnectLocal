package com.connectlocal.exception;

/**
 * Thrown when a requested entity (User, Service, Booking, Review) cannot be found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
