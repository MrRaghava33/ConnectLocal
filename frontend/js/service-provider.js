/**
 * ConnectLocal Provider Dashboard Controller
 */

let activeProviderTab = 'dashboard';
let currentProvider = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check & User personalization
    currentProvider = Utils.getCurrentUser();
    if (!currentProvider || currentProvider.role !== 'provider') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize Page Details
    refreshProviderData();

    // Fill profile fields
    document.getElementById('profile-name').value = currentProvider.name;
    document.getElementById('profile-title').value = currentProvider.title;
    document.getElementById('profile-phone').value = currentProvider.phone;
    document.getElementById('profile-location').value = currentProvider.location.split(' (')[0];
    document.getElementById('profile-details').value = currentProvider.details;
});

/**
 * Reload provider details, statistics, and tables
 */
function refreshProviderData() {
    // Reload the provider's public service profile from the backend.
    const updatedUser = API.getProviderById(currentProvider.id);
    if (updatedUser) {
        currentProvider = { ...currentProvider, ...updatedUser };
        Utils.setCurrentUser(currentProvider);
    }

    // Default safe fallbacks
    const img = currentProvider.profileImg || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&fit=crop&q=60';
    const title = currentProvider.title || 'Service Provider';
    const rating = typeof currentProvider.rating === 'number' ? currentProvider.rating.toFixed(1) : '5.0';
    const reviewsCount = currentProvider.reviewsCount || 0;

    // Avatars & Titles
    document.getElementById('header-avatar').src = img;
    document.getElementById('summary-avatar').src = img;
    document.getElementById('summary-name').textContent = currentProvider.name;
    document.getElementById('summary-title').textContent = title;
    document.getElementById('summary-rating').textContent = rating;
    document.getElementById('summary-reviews-count').textContent = `(${reviewsCount} reviews)`;

    // Check status switch
    const switchEl = document.getElementById('status-toggle-switch');
    if (switchEl) {
        switchEl.checked = !!currentProvider.online;
        updateOnlineStatusUI(!!currentProvider.online);
    }

    // Refresh metrics & lists
    updateStatistics();
    renderRecentRequests();
    renderTodaySchedule();
    renderProviderBookings();
    renderServicesManagement();
}

/**
 * Calculate & Render Statistics Cards
 */
function updateStatistics() {
    const stats = API.getProviderStats(currentProvider.id);
    
    document.getElementById('stat-earnings').textContent = Utils.formatCurrency(stats.earnings);
    document.getElementById('stat-completed-count').textContent = stats.completedCount;
    document.getElementById('stat-pending-count').textContent = stats.pendingCount;
    document.getElementById('stat-completion-rate').textContent = `${stats.completionRate}%`;

    // Update pending badge count
    const badge = document.getElementById('pending-badge-count');
    if (badge) badge.textContent = `${stats.pendingCount} pending`;

    const bellDot = document.getElementById('provider-noti-dot');
    if (bellDot) {
        if (stats.pendingCount > 0) {
            bellDot.style.display = 'block';
        } else {
            bellDot.style.display = 'none';
        }
    }
}

/**
 * Render Recent Incoming Requests (Pending Status)
 */
function renderRecentRequests() {
    const container = document.getElementById('recent-requests-list');
    if (!container) return;
    container.innerHTML = '';

    const bookings = API.getBookingsForUser(currentProvider.id, 'provider');
    const pending = bookings.filter(b => b.status === 'Pending');

    if (pending.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                <i class="fas fa-inbox" style="font-size: 24px; margin-bottom: 8px; color: #cbd5e1;"></i>
                <p style="font-size: 13px;">No new requests at the moment.</p>
            </div>
        `;
        return;
    }

    pending.forEach(b => {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="request-header">
                <span class="request-client"><i class="far fa-user"></i> ${b.seekerName}</span>
                <span class="request-date">${Utils.formatDate(b.date)}</span>
            </div>
            <div style="font-size: 13px; font-weight: 600; color: var(--primary-color); margin-bottom: 8px;">
                Requested Slot: ${b.timeSlot} (${b.serviceCategory || 'Service'})
            </div>
            ${b.notes ? `<div class="request-details"><strong>Notes:</strong> "${b.notes}"</div>` : ''}
            <div class="request-actions">
                <button class="btn-accept" onclick="respondToRequest('${b.id}', 'Approved')">Accept Request</button>
                <button class="btn-decline" onclick="respondToRequest('${b.id}', 'Declined')">Decline</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Render Schedule overview (Approved Status)
 */
function renderTodaySchedule() {
    const container = document.getElementById('today-bookings-list');
    if (!container) return;
    container.innerHTML = '';

    const bookings = API.getBookingsForUser(currentProvider.id, 'provider');
    const active = bookings.filter(b => b.status === 'Approved' || b.status === 'Completed');

    if (active.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px 10px; color: var(--text-muted);">
                <p style="font-size: 13px;">No active bookings scheduled.</p>
            </div>
        `;
        return;
    }

    // Sort by date then slot
    active.sort((a,b) => new Date(a.date) - new Date(b.date));

    // Show top 3
    active.slice(0, 3).forEach(b => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-time">${b.timeSlot}</div>
            <div class="schedule-info">
                <h4>${b.seekerName}</h4>
                <p>${Utils.formatDate(b.date)} &bull; Status: <strong>${b.status}</strong></p>
            </div>
        `;
        container.appendChild(item);
    });
}

/**
 * Render complete Bookings history table
 */
function renderProviderBookings() {
    const tableBody = document.getElementById('provider-bookings-rows');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const bookings = API.getBookingsForUser(currentProvider.id, 'provider');

    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No booking records found.</p>
                </td>
            </tr>
        `;
        return;
    }

    bookings.forEach(b => {
        const row = document.createElement('tr');
        
        let badgeClass = 'status-pending';
        if (b.status === 'Approved') badgeClass = 'status-approved';
        if (b.status === 'Declined') badgeClass = 'status-declined';
        if (b.status === 'Completed') badgeClass = 'status-completed';

        // Actions
        let actionBtn = '-';
        if (b.status === 'Approved') {
            actionBtn = `<button class="btn btn-primary" onclick="completeBooking('${b.id}')" style="padding: 6px 12px; font-size: 11px; border-radius: 6px;">Mark Complete</button>`;
        }

        const formattedId = b.id.length > 6 ? b.id.substring(b.id.length - 6) : b.id;

        row.innerHTML = `
            <td><strong>#${formattedId}</strong></td>
            <td>${b.seekerName}</td>
            <td>${Utils.formatDate(b.date)} &bull; ${b.timeSlot}</td>
            <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${b.notes || ''}">${b.notes || 'N/A'}</td>
            <td><strong>$${b.rate}/hr</strong></td>
            <td><span class="status-badge ${badgeClass}"><i class="fas fa-circle" style="font-size: 6px;"></i> ${b.status}</span></td>
            <td>${actionBtn}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Render offered services panel
 */
function renderServicesManagement() {
    const listEl = document.getElementById('services-manage-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Standard list of categories
    const categories = ['Electrician', 'Plumber', 'Tutor', 'Cleaning', 'Handyman', 'Pet Care', 'Gardening'];
    
    categories.forEach(cat => {
        const isOffered = currentProvider.category.toLowerCase() === cat.toLowerCase();
        const activeClass = isOffered ? 'active' : '';
        const checked = isOffered ? 'checked' : '';
        const rate = isOffered ? currentProvider.rate : 40; // baseline

        const item = document.createElement('div');
        item.className = `service-manage-item ${activeClass}`;
        item.innerHTML = `
            <div class="service-manage-left">
                <input type="radio" name="provider-primary-service" class="service-manage-checkbox" ${checked} value="${cat}" onchange="toggleServiceItem(this)">
                <div class="service-manage-info">
                    <h4>${cat} Services</h4>
                    <p>Toggle to set as your primary trade category</p>
                </div>
            </div>
            <div class="service-manage-right">
                <span>Hourly Rate ($):</span>
                <input type="number" class="service-price-input" id="price-input-${cat}" value="${rate}" min="15" max="300" ${isOffered ? '' : 'disabled'}>
            </div>
        `;
        listEl.appendChild(item);
    });
}

/**
 * Handle Primary Service Radio toggling
 */
function toggleServiceItem(radioEl) {
    const selectedCat = radioEl.value;
    
    // Toggle input disabled states
    const priceInputs = document.querySelectorAll('.service-price-input');
    priceInputs.forEach(input => {
        input.disabled = true;
    });

    const activePriceInput = document.getElementById(`price-input-${selectedCat}`);
    if (activePriceInput) {
        activePriceInput.disabled = false;
    }

    // Toggle active borders in CSS
    const items = document.querySelectorAll('.service-manage-item');
    items.forEach(item => item.classList.remove('active'));
    radioEl.closest('.service-manage-item').classList.add('active');
}
window.toggleServiceItem = toggleServiceItem;

/**
 * Save provider services settings
 */
function saveServicesPricing() {
    const selectedRadio = document.querySelector('input[name="provider-primary-service"]:checked');
    if (!selectedRadio) {
        Utils.showToast('Please select your trade category.', 'error');
        return;
    }

    const cat = selectedRadio.value;
    const rateVal = parseFloat(document.getElementById(`price-input-${cat}`).value);

    if (isNaN(rateVal) || rateVal < 15 || rateVal > 300) {
        Utils.showToast('Please specify a reasonable hourly rate ($15 - $300).', 'error');
        return;
    }

    // Save changes to API
    const response = API.updateProviderProfile(currentProvider.id, {
        category: cat,
        rate: rateVal,
        title: currentProvider.title.includes('Local') || currentProvider.title === '' ? `Local ${cat}` : currentProvider.title
    });

    if (response.success) {
        Utils.showToast('Services details updated successfully!', 'success');
        refreshProviderData();
        switchProviderTab('dashboard');
    } else {
        Utils.showToast(response.message, 'error');
    }
}
window.saveServicesPricing = saveServicesPricing;

/**
 * Accept / Decline booking request
 */
function respondToRequest(bookingId, status) {
    const response = API.updateBookingStatus(bookingId, status);
    if (response.success) {
        if (status === 'Approved') {
            Utils.showToast('Booking request accepted successfully!', 'success');
        } else {
            Utils.showToast('Booking request declined.', 'info');
        }
        refreshProviderData();
    } else {
        Utils.showToast(response.message, 'error');
    }
}
window.respondToRequest = respondToRequest;

/**
 * Mark active booking as Completed
 */
function completeBooking(bookingId) {
    const response = API.updateBookingStatus(bookingId, 'Completed');
    if (response.success) {
        Utils.showToast('Job marked as completed. Earnings updated!', 'success');
        refreshProviderData();
    } else {
        Utils.showToast(response.message, 'error');
    }
}
window.completeBooking = completeBooking;

/**
 * Toggle Online Availability switch
 */
function toggleOnlineStatus(switchEl) {
    const online = switchEl.checked;
    
    const response = API.updateProviderProfile(currentProvider.id, { online: online });
    if (response.success) {
        updateOnlineStatusUI(online);
        Utils.showToast(`Your status is now ${online ? 'Online' : 'Offline'}.`, 'success');
    }
}
window.toggleOnlineStatus = toggleOnlineStatus;

function updateOnlineStatusUI(online) {
    const dot = document.getElementById('summary-status-dot');
    const text = document.getElementById('summary-status-text');
    
    if (online) {
        dot.classList.remove('offline');
        text.textContent = 'Online';
    } else {
        dot.classList.add('offline');
        text.textContent = 'Offline';
    }
}

/**
 * Switch tabs in dashboard
 */
function switchProviderTab(tabName) {
    activeProviderTab = tabName;

    // Remove active styles from sidebar items
    const menuDashboard = document.getElementById('menu-prov-dashboard');
    const menuServices = document.getElementById('menu-prov-services');
    const menuBookings = document.getElementById('menu-prov-bookings');
    const menuProfile = document.getElementById('menu-prov-profile');

    menuDashboard.classList.remove('active');
    menuServices.classList.remove('active');
    menuBookings.classList.remove('active');
    menuProfile.classList.remove('active');

    // Hide all views
    document.getElementById('tab-prov-dashboard').style.display = 'none';
    document.getElementById('tab-prov-services').style.display = 'none';
    document.getElementById('tab-prov-bookings').style.display = 'none';
    document.getElementById('tab-prov-profile').style.display = 'none';

    // Show selected view & add sidebar active classes
    if (tabName === 'dashboard') {
        menuDashboard.classList.add('active');
        document.getElementById('tab-prov-dashboard').style.display = 'block';
    } else if (tabName === 'services') {
        menuServices.classList.add('active');
        document.getElementById('tab-prov-services').style.display = 'block';
    } else if (tabName === 'bookings') {
        menuBookings.classList.add('active');
        document.getElementById('tab-prov-bookings').style.display = 'block';
    } else if (tabName === 'profile') {
        menuProfile.classList.add('active');
        document.getElementById('tab-prov-profile').style.display = 'block';
    }
}
window.switchProviderTab = switchProviderTab;

/**
 * Save provider Profile details form
 */
function saveProviderProfile(e) {
    e.preventDefault();
    
    const nameVal = document.getElementById('profile-name').value.trim();
    const titleVal = document.getElementById('profile-title').value.trim();
    const phoneVal = document.getElementById('profile-phone').value.trim();
    const locVal = document.getElementById('profile-location').value.trim();
    const detailsVal = document.getElementById('profile-details').value.trim();

    // Validations
    if (!nameVal || !titleVal || !phoneVal || !locVal || !detailsVal) {
        Utils.showToast('Please fill out all fields.', 'error');
        return;
    }

    const phoneCheck = Validation.validatePhone(phoneVal);
    if (!phoneCheck.isValid) {
        Utils.showToast(phoneCheck.message, 'error');
        return;
    }

    // Save
    const response = API.updateProviderProfile(currentProvider.id, {
        name: nameVal,
        title: titleVal,
        phone: phoneVal,
        location: locVal + ' (0.0 miles)',
        details: detailsVal
    });

    if (response.success) {
        Utils.showToast('Profile information saved!', 'success');
        refreshProviderData();
        switchProviderTab('dashboard');
    } else {
        Utils.showToast(response.message, 'error');
    }
}
window.saveProviderProfile = saveProviderProfile;
