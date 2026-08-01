/**
 * ConnectLocal Seeker Dashboard Controller
 */

let activeTab = 'dashboard';
let currentCategoryFilter = 'All';
let currentSearchQuery = '';
let activeSelectedProvider = null;
let activeSelectedSlot = '';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check & User personalization
    const currentUser = Utils.getCurrentUser();
    if (!currentUser || currentUser.role !== 'seeker') {
        window.location.href = 'login.html';
        return;
    }

    // Set user avatar text
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('avatar-circle').textContent = initials;

    // Prefill settings form
    document.getElementById('settings-name').value = currentUser.name;
    document.getElementById('settings-phone').value = currentUser.phone;

    // Check if category or query was passed in search from landing page
    const urlParams = new URLSearchParams(window.location.search);
    const landingCat = urlParams.get('category');
    const landingQuery = urlParams.get('query');

    if (landingCat) {
        currentCategoryFilter = landingCat;
        // Make corresponding chip active
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            if (chip.textContent.trim().toLowerCase() === landingCat.toLowerCase()) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    if (landingQuery) {
        currentSearchQuery = landingQuery;
        document.getElementById('global-search-input').value = landingQuery;
    }

    // Initialize provider listings
    renderProviders();

    // 2. Search Box Filter Listener
    const globalSearch = document.getElementById('global-search-input');
    globalSearch.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        renderProviders();
    });

    // 3. Booking Submit Handler
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBookingRequest();
        });
    }
});

/**
 * Filter providers by category chips
 */
function filterCategory(category, chipElement) {
    currentCategoryFilter = category;
    
    // Toggle active classes
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => chip.classList.remove('active'));
    chipElement.classList.add('active');

    // If detail view is open, close it and go back to browse
    goBackToBrowse();
    renderProviders();
}
window.filterCategory = filterCategory;

/**
 * Render list of service providers inside grid
 */
function renderProviders() {
    const grid = document.getElementById('providers-grid-list');
    const countEl = document.getElementById('providers-count');
    const titleEl = document.getElementById('listings-title');
    
    if (!grid) return;
    grid.innerHTML = '';

    // Fetch filtered list from api.js
    const providers = API.getProviders(currentSearchQuery, currentCategoryFilter);
    countEl.textContent = `${providers.length} professionals found`;
    
    if (currentCategoryFilter !== 'All') {
        titleEl.textContent = `Available ${currentCategoryFilter}s`;
    } else {
        titleEl.textContent = 'Available Service Providers';
    }

    if (providers.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 20px; border: 1px solid var(--border-color);">
                <i class="fas fa-search" style="font-size: 40px; color: var(--text-muted); margin-bottom: 16px;"></i>
                <h4>No service providers found</h4>
                <p style="color: var(--text-muted); font-size: 14px;">Try searching for something else or changing categories.</p>
            </div>
        `;
        return;
    }

    providers.forEach(prov => {
        const card = document.createElement('div');
        card.className = 'card provider-card';
        card.innerHTML = `
            <div class="provider-card-img" style="background-image: url('${prov.profileImg}'); background-size: cover; background-position: center;">
                <div class="like-button" onclick="toggleLike(event, this)">
                    <i class="fas fa-heart"></i>
                </div>
            </div>
            <div class="provider-card-body">
                <div class="provider-meta">
                    <div class="provider-name-container">
                        <span class="provider-card-name">${prov.name}</span>
                        <i class="fas fa-check-circle verified-badge" title="Verified Professional"></i>
                    </div>
                    <span class="provider-rating">
                        <i class="fas fa-star"></i> ${prov.rating.toFixed(1)} <span>(${prov.reviewsCount})</span>
                    </span>
                </div>
                <div class="provider-card-title">${prov.title}</div>
                <div class="provider-stats-bar">
                    <span class="stat-metric">
                        <i class="fas fa-map-marker-alt"></i> ${prov.location.split(' ')[0]}
                    </span>
                    <span class="stat-metric">
                        <span class="price">$${prov.rate}</span>/hr
                    </span>
                </div>
                <button type="button" class="btn btn-primary btn-book-card" onclick="goToShowProvider('${prov.id}')">Book Now</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

/**
 * Handle details view redirection
 */
function goToShowProvider(providerId) {
    const prov = API.getProviderById(providerId);
    if (!prov) return;

    activeSelectedProvider = prov;
    activeSelectedSlot = ''; // Reset selected slot

    // Populate detail elements
    document.getElementById('breadcrumb-active-page').textContent = prov.name;
    document.getElementById('detail-main-image').src = prov.profileImg;
    document.getElementById('detail-provider-avatar').src = prov.profileImg;
    document.getElementById('detail-provider-name').innerHTML = `${prov.name} <i class="fas fa-check-circle verified-badge"></i>`;
    document.getElementById('detail-provider-title').textContent = prov.title;
    document.getElementById('detail-provider-distance').textContent = prov.location;
    document.getElementById('detail-about-text').textContent = prov.details;
    document.getElementById('widget-hourly-rate').innerHTML = `$${prov.rate}<span>/hour</span>`;

    // Populate Category badges
    const tagContainer = document.getElementById('detail-tag-container');
    tagContainer.innerHTML = `
        <span class="tag-badge">${prov.category}</span>
        <span class="tag-badge">Local Pro</span>
        <span class="tag-badge">${prov.location.split(' ')[0]} Area</span>
    `;

    // Reset date input & slots UI
    document.getElementById('booking-date').value = '';
    const slots = document.querySelectorAll('.slot-btn');
    slots.forEach(btn => btn.classList.remove('active'));

    // Toggle panels
    document.getElementById('tab-dashboard-view').style.display = 'none';
    const detailView = document.getElementById('tab-detail-view');
    detailView.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.goToShowProvider = goToShowProvider;

/**
 * Return to search listings
 */
function goBackToBrowse(e) {
    if (e) e.preventDefault();
    
    document.getElementById('tab-detail-view').style.display = 'none';
    document.getElementById('tab-dashboard-view').style.display = 'block';
    activeSelectedProvider = null;
}
window.goBackToBrowse = goBackToBrowse;

/**
 * Set selected timeslot
 */
function selectSlot(timeStr, btnElement) {
    activeSelectedSlot = timeStr;
    const buttons = document.querySelectorAll('.slot-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
}
window.selectSlot = selectSlot;

/**
 * Submit booking details
 */
function submitBookingRequest() {
    if (!activeSelectedProvider) {
        Utils.showToast('Please select a service provider first.', 'error');
        return;
    }

    const dateVal = document.getElementById('booking-date').value;
    if (!dateVal) {
        Utils.showToast('Please select a booking date.', 'error');
        return;
    }

    // Validate that date is today or in future
    const selectedDate = new Date(dateVal);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selectedDate < today) {
        Utils.showToast('Please choose today or a future date.', 'error');
        return;
    }

    if (!activeSelectedSlot) {
        Utils.showToast('Please select an available time slot.', 'error');
        return;
    }

    const notesVal = document.getElementById('booking-notes').value.trim();
    const currentUser = Utils.getCurrentUser();

    // Compile booking data
    const bookingPayload = {
        seekerId: currentUser.id,
        seekerName: currentUser.name,
        providerId: activeSelectedProvider.id,
        serviceId: activeSelectedProvider.serviceId,
        providerName: activeSelectedProvider.name,
        serviceCategory: activeSelectedProvider.category,
        date: dateVal,
        timeSlot: activeSelectedSlot,
        rate: activeSelectedProvider.rate,
        notes: notesVal
    };

    const reqBtn = document.getElementById('btn-request-booking');
    reqBtn.disabled = true;
    reqBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Booking...';

    setTimeout(() => {
        const response = API.createBooking(bookingPayload);
        if (response.success) {
            Utils.showToast('Booking request sent successfully!', 'success');
            
            // Clear inputs
            document.getElementById('booking-notes').value = '';
            
            // Shift to Bookings Tab
            switchTab('bookings');
        } else {
            Utils.showToast('Failed to complete booking request.', 'error');
        }
        reqBtn.disabled = false;
        reqBtn.textContent = 'Request Booking';
    }, 1200);
}

/**
 * Switch view tabs (Dashboard, Bookings, Settings)
 */
function switchTab(tabName) {
    activeTab = tabName;

    // Toggle menu items active states
    const menuDashboard = document.getElementById('menu-dashboard');
    const menuServices = document.getElementById('menu-services');
    const menuBookings = document.getElementById('menu-bookings');
    const menuSettings = document.getElementById('menu-settings');

    menuDashboard.classList.remove('active');
    menuServices.classList.remove('active');
    menuBookings.classList.remove('active');
    menuSettings.classList.remove('active');

    // Set matching active states
    if (tabName === 'dashboard') {
        menuDashboard.classList.add('active');
        menuServices.classList.add('active');
        document.getElementById('tab-dashboard-view').style.display = 'block';
        document.getElementById('tab-detail-view').style.display = 'none';
        document.getElementById('tab-bookings-view').style.display = 'none';
        document.getElementById('tab-settings-view').style.display = 'none';
    } else if (tabName === 'bookings') {
        menuBookings.classList.add('active');
        document.getElementById('tab-dashboard-view').style.display = 'none';
        document.getElementById('tab-detail-view').style.display = 'none';
        document.getElementById('tab-bookings-view').style.display = 'block';
        document.getElementById('tab-settings-view').style.display = 'none';
        
        renderBookingsList();
    } else if (tabName === 'settings') {
        menuSettings.classList.add('active');
        document.getElementById('tab-dashboard-view').style.display = 'none';
        document.getElementById('tab-detail-view').style.display = 'none';
        document.getElementById('tab-bookings-view').style.display = 'none';
        document.getElementById('tab-settings-view').style.display = 'block';
    }
}
window.switchTab = switchTab;

/**
 * Render customer bookings list inside the table
 */
function renderBookingsList() {
    const tableBody = document.getElementById('bookings-table-rows');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const currentUser = Utils.getCurrentUser();
    const bookings = API.getBookingsForUser(currentUser.id, 'seeker');

    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-calendar-times" style="font-size: 32px; margin-bottom: 12px;"></i>
                    <p>No booked services found.</p>
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

        const formattedId = b.id.length > 6 ? b.id.substring(b.id.length - 6) : b.id;

        row.innerHTML = `
            <td><strong>#${formattedId}</strong></td>
            <td>${b.providerName}</td>
            <td><span class="tag-badge" style="background-color: var(--bg-color); color: var(--text-main); font-weight: 500;">${b.serviceCategory}</span></td>
            <td>${Utils.formatDate(b.date)} &bull; ${b.timeSlot}</td>
            <td><strong>$${b.rate}/hr</strong></td>
            <td><span class="status-badge ${badgeClass}"><i class="fas fa-circle" style="font-size: 6px;"></i> ${b.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Save user profile settings changes
 */
function saveSettings(e) {
    e.preventDefault();
    const nameVal = document.getElementById('settings-name').value.trim();
    const phoneVal = document.getElementById('settings-phone').value.trim();

    const nameCheck = Validation.validateRequired(nameVal, 'Full Name');
    if (!nameCheck.isValid) {
        Utils.showToast(nameCheck.message, 'error');
        return;
    }

    const phoneCheck = Validation.validatePhone(phoneVal);
    if (!phoneCheck.isValid) {
        Utils.showToast(phoneCheck.message, 'error');
        return;
    }

    const currentUser = Utils.getCurrentUser();
    const response = API.updateProviderProfile(currentUser.id, { name: nameVal, phone: phoneVal });
    if (response.success) {
        currentUser.name = response.user.name;
        currentUser.phone = response.user.phone;
        Utils.setCurrentUser(currentUser);

        // Re-read avatar
        const initials = nameVal.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        document.getElementById('avatar-circle').textContent = initials;

        Utils.showToast('Profile updated successfully!', 'success');
    } else {
        Utils.showToast(response.message || 'Could not update your profile.', 'error');
    }
}
window.saveSettings = saveSettings;

/**
 * Toggle listing wishlist heart
 */
function toggleLike(e, element) {
    e.stopPropagation();
    element.classList.toggle('liked');
    if (element.classList.contains('liked')) {
        Utils.showToast('Saved to your favorites!', 'success');
    } else {
        Utils.showToast('Removed from favorites', 'info');
    }
}
window.toggleLike = toggleLike;
