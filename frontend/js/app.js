/**
 * ConnectLocal Landing Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check User Session
    const currentUser = Utils.getCurrentUser();
    const authButtons = document.getElementById('auth-buttons');
    const userProfileMenu = document.getElementById('user-profile-menu');
    const userGreeting = document.getElementById('user-greeting');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const navBecomeProvider = document.getElementById('nav-become-provider');

    if (currentUser) {
        // Toggle Navbar Buttons
        authButtons.style.display = 'none';
        userProfileMenu.style.display = 'flex';
        
        // Welcome Text
        userGreeting.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
        
        // Set proper dashboard link
        if (currentUser.role === 'seeker') {
            dashboardBtn.href = 'pages/service-seeker.html';
        } else {
            dashboardBtn.href = 'pages/service-provider.html';
        }

        // Adjust Become Provider navigation
        if (currentUser.role === 'provider') {
            navBecomeProvider.style.display = 'none';
        } else {
            navBecomeProvider.addEventListener('click', (e) => {
                e.preventDefault();
                Utils.showToast('Log out first to register as a Service Provider.', 'info');
            });
        }
    } else {
        authButtons.style.display = 'flex';
        userProfileMenu.style.display = 'none';

        // Become a provider redirect
        navBecomeProvider.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'pages/signup.html?role=provider';
        });
    }

    // 2. Sticky Glass Header Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(16, 29, 69, 0.08)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = 'var(--shadow-sm)';
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    });

    // 3. Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    menuToggle.addEventListener('click', () => {
        if (navMenu.style.display === 'flex') {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'flex';
            navMenu.style.cssText = `
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 80px;
                left: 0;
                width: 100%;
                background: white;
                box-shadow: var(--shadow-lg);
                padding: 24px;
                gap: 20px;
            `;
        }
    });

    // 4. Hero Search Event Listeners
    const searchBtn = document.getElementById('hero-search-btn');
    const searchInput = document.getElementById('hero-search-input');
    const categorySelect = document.getElementById('hero-category-select');

    const handleSearch = () => {
        const query = encodeURIComponent(searchInput.value.trim());
        const category = encodeURIComponent(categorySelect.value);
        window.location.href = `pages/service-seeker.html?query=${query}&category=${category}`;
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});

/**
 * Handle navigation directly from service card clicks
 * @param {string} category 
 */
function navigateToSearch(category) {
    window.location.href = `pages/service-seeker.html?category=${encodeURIComponent(category)}`;
}
window.navigateToSearch = navigateToSearch;
