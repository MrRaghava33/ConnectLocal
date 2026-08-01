/**
 * ConnectLocal Validation Utilities
 */

const Validation = {
    /**
     * Validate email syntax
     * @param {string} email 
     */
    validateEmail(email) {
        if (!email) return { isValid: false, message: 'Email address is required.' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }
        return { isValid: true, message: '' };
    },

    /**
     * Validate phone number syntax (expects a standard 10 digit number)
     * @param {string} phone 
     */
    validatePhone(phone) {
        if (!phone) return { isValid: false, message: 'Phone number is required.' };
        const phoneCleaned = phone.replace(/\D/g, '');
        if (phoneCleaned.length < 10 || phoneCleaned.length > 15) {
            return { isValid: false, message: 'Phone number must be between 10 and 15 digits.' };
        }
        return { isValid: true, message: '' };
    },

    /**
     * Validate password strength
     * @param {string} password 
     */
    validatePassword(password) {
        if (!password) return { isValid: false, message: 'Password is required.' };
        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long.' };
        }
        let score = 0;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score < 3) {
            return { isValid: false, message: 'Password must contain a mix of uppercase, lowercase, numbers, and special characters.' };
        }
        return { isValid: true, message: '' };
    },

    /**
     * Compare password and confirmation
     * @param {string} password 
     * @param {string} confirmPassword 
     */
    validatePasswordMatch(password, confirmPassword) {
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }
        return { isValid: true, message: '' };
    },

    /**
     * Validate that a field is not empty
     * @param {string} value 
     * @param {string} fieldName 
     */
    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            return { isValid: false, message: `${fieldName} is required.` };
        }
        return { isValid: true, message: '' };
    }
};
window.Validation = Validation;
