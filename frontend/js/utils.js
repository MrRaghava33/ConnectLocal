/**
 * ConnectLocal Utilities Library
 */

const Utils = {
    /**
     * Show a custom Toast Notification
     * @param {string} message - Message to display
     * @param {'success' | 'error' | 'info'} type - Type of toast
     */
    showToast(message, type = 'success') {
        // Check if container exists, else create it
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let bgColor = '#355DB7'; // success / default primary
        if (type === 'error') bgColor = '#E53E3E';
        if (type === 'info') bgColor = '#3182CE';

        toast.style.cssText = `
            background-color: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            pointer-events: auto;
        `;

        // Icons
        let icon = '<i class="fas fa-check-circle"></i>';
        if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
        if (type === 'info') icon = '<i class="fas fa-info-circle"></i>';

        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Remove toast
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    },

    /**
     * Format numbers into USD currency format
     * @param {number} amount 
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    /**
     * Format dates to a readable string (e.g. July 15, 2026)
     * @param {string|Date} dateVal 
     */
    formatDate(dateVal) {
        if (!dateVal) return '';
        const date = new Date(dateVal);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Save currently logged in user to session storage
     * @param {object} user 
     */
    setCurrentUser(user) {
        sessionStorage.setItem('cl_session_user', JSON.stringify(user));
    },

    /**
     * Fetch currently logged in user from session storage
     */
    getCurrentUser() {
        const user = sessionStorage.getItem('cl_session_user');
        return user ? JSON.parse(user) : null;
    },

    /**
     * Clear user session and redirect to landing page
     */
    logout() {
        sessionStorage.removeItem('cl_session_user');
        sessionStorage.removeItem('cl_token');
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 800);
    }
};
window.Utils = Utils;
