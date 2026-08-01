/**
 * ConnectLocal REST API client.
 *
 * This replaces the previous localStorage mock. The dashboard was written
 * synchronously, so this small adapter uses synchronous XMLHttpRequest to keep
 * the existing UI compatible while talking to Spring Boot at localhost:8080.
 */
const API = {
    baseUrl: 'http://localhost:8080/api',

    _request(method, path, body) {
        const request = new XMLHttpRequest();
        request.open(method, `${this.baseUrl}${path}`, false);
        request.setRequestHeader('Content-Type', 'application/json');
        const token = sessionStorage.getItem('cl_token');
        if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
        try {
            request.send(body ? JSON.stringify(body) : null);
            const data = request.responseText ? JSON.parse(request.responseText) : null;
            if (request.status >= 200 && request.status < 300) return { success: true, data };
            return { success: false, message: data?.message || data?.error || 'The server rejected the request.' };
        } catch (error) {
            return { success: false, message: 'Cannot reach the backend. Start Spring Boot on port 8080.' };
        }
    },

    _role(role) { return role === 'provider' || role === 'SERVICE_PROVIDER' ? 'provider' : 'seeker'; },
    _status(status) {
        const values = { PENDING: 'Pending', ACCEPTED: 'Approved', REJECTED: 'Declined', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
        return values[status] || status;
    },
    _time(value) {
        if (!value) return '';
        const [hours, minutes] = value.split(':').map(Number);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
    },
    _toTime(value) {
        const match = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return '09:00:00';
        let hours = Number(match[1]);
        if (match[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
        if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${match[2]}:00`;
    },
    _provider(service) {
        return {
            id: String(service.providerId), serviceId: service.id, name: service.providerName,
            role: 'provider', category: service.category, location: service.location,
            rate: service.price, title: service.title, details: service.description || 'Professional local services provider.',
            profileImg: service.imageUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&fit=crop&q=60',
            rating: 5, reviewsCount: 0, online: service.availability !== 'Offline'
        };
    },
    _booking(booking) {
        return {
            id: String(booking.id),
            serviceId: booking.serviceId,
            seekerId: String(booking.seekerId),
            seekerName: booking.seekerName || 'Service Seeker',
            providerId: String(booking.providerId),
            providerName: booking.providerName || 'Service Provider',
            serviceCategory: booking.serviceTitle || 'Service',
            date: booking.bookingDate,
            timeSlot: this._time(booking.bookingTime),
            rate: booking.price || 0,
            notes: booking.notes || '',
            status: this._status(booking.status)
        };
    },

    login(email, password) {
        const result = this._request('POST', '/auth/login', { email, password });
        if (!result.success) return result;
        sessionStorage.setItem('cl_token', result.data.token);
        const account = this._request('GET', `/users/${result.data.userId}`);
        let user = {
            id: String(result.data.userId), name: result.data.fullName, email: result.data.email,
            phone: account.success ? account.data.phone : '', role: this._role(result.data.role)
        };
        if (user.role === 'provider') {
            const provider = this.getProviders().find(item => item.id === user.id);
            user = { ...user, ...(provider || {}), id: user.id, name: result.data.fullName, role: 'provider' };
        }
        return { success: true, user };
    },

    register(userData) {
        const payload = { fullName: userData.name, email: userData.email, phone: String(userData.phone).replace(/\D/g, ''), password: userData.password,
            role: userData.role === 'provider' ? 'SERVICE_PROVIDER' : 'SERVICE_SEEKER' };
        const registered = this._request('POST', '/auth/register', payload);
        if (!registered.success) return registered;
        const login = this.login(payload.email, payload.password);
        if (!login.success) return login;
        if (userData.role === 'provider') {
            const service = this._request('POST', `/services?providerId=${login.user.id}`, {
                title: userData.title || `Local ${userData.category}`, description: userData.details || 'Professional local services provider.',
                category: userData.category || 'Handyman', price: userData.rate || 50, location: userData.location || 'Local area', availability: 'Available', imageUrl: ''
            });
            if (!service.success) return service;
            login.user = { ...login.user, ...this._provider(service.data) };
        }
        return login;
    },

    getProviders(query = '', category = '') {
        const result = this._request('GET', `/services${query ? `?keyword=${encodeURIComponent(query)}` : ''}`);
        if (!result.success) return [];
        return result.data.map(item => this._provider(item)).filter(item => !category || category === 'All' || item.category.toLowerCase() === category.toLowerCase());
    },
    getProviderById(id) { return this.getProviders().find(item => item.id === String(id)) || null; },
    getBookingsForUser(userId, role) {
        const parameter = role === 'provider' ? 'providerId' : 'seekerId';
        const result = this._request('GET', `/bookings?${parameter}=${encodeURIComponent(userId)}`);
        return result.success ? result.data.map(item => this._booking(item)) : [];
    },
    createBooking(data) {
        const result = this._request('POST', `/bookings?seekerId=${encodeURIComponent(data.seekerId)}`, {
            serviceId: data.serviceId || data.providerServiceId,
            bookingDate: data.date,
            bookingTime: this._toTime(data.timeSlot),
            notes: data.notes || '',
            price: data.rate || 0
        });
        return result.success ? { success: true, booking: this._booking(result.data) } : result;
    },
    updateBookingStatus(id, status) {
        const mapped = { Approved: 'ACCEPTED', Declined: 'REJECTED', Completed: 'COMPLETED' };
        const result = this._request('PUT', `/bookings/${id}?status=${mapped[status] || status}`, null);
        return result.success ? { success: true, booking: this._booking(result.data) } : result;
    },
    updateProviderProfile(id, profile) {
        const accountPayload = { id: Number(id) };
        if (profile.name) accountPayload.fullName = profile.name;
        if (profile.phone) accountPayload.phone = String(profile.phone).replace(/\D/g, '');
        const account = this._request('PUT', `/users/${id}`, accountPayload);
        if (!account.success) return account;
        let provider = this.getProviderById(id);
        if (!provider && (profile.category || profile.rate || profile.title)) {
            const service = this._request('POST', `/services?providerId=${id}`, {
                title: profile.title || `Local ${profile.category || 'Handyman'}`, description: profile.details || 'Professional local services provider.',
                category: profile.category || 'Handyman', price: profile.rate || 50, location: profile.location || 'Local area', availability: 'Available', imageUrl: ''
            });
            if (service.success) {
                provider = this._provider(service.data);
            }
        } else if (provider && (profile.category || profile.rate || profile.title || profile.location || profile.details || typeof profile.online === 'boolean')) {
            const service = this._request('PUT', `/services/${provider.serviceId}`, {
                id: provider.serviceId, title: profile.title || provider.title, description: profile.details || provider.details,
                category: profile.category || provider.category, price: profile.rate || provider.rate,
                location: profile.location || provider.location,
                availability: typeof profile.online === 'boolean' ? (profile.online ? 'Available' : 'Offline') : (provider.online ? 'Available' : 'Offline'),
                imageUrl: provider.profileImg
            });
            if (!service.success) return service;
        }
        return { success: true, user: {
            id: String(account.data.id), name: account.data.fullName, email: account.data.email,
            phone: account.data.phone, role: this._role(account.data.role)
        } };
    },
    getProviderStats(id) {
        const bookings = this.getBookingsForUser(id, 'provider');
        const completed = bookings.filter(item => item.status === 'Completed');
        const pending = bookings.filter(item => item.status === 'Pending');
        const active = bookings.filter(item => item.status === 'Approved');
        const totalEarnings = completed.reduce((sum, item) => sum + (Number(item.rate) || 0), 0);
        return { earnings: totalEarnings, completedCount: completed.length, pendingCount: pending.length, activeCount: active.length,
            completionRate: bookings.length ? Math.round(completed.length * 100 / bookings.length) : 100 };
    }
};
window.API = API;
