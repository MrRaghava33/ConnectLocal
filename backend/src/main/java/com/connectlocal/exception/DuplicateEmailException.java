package com.connectlocal.exception;

/**
 * Thrown during registration when the email (or phone) is already in use.
 */
public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String message) {
        super(message);
    }
}
