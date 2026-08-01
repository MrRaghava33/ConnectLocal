/**
 * ConnectLocal Login Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Password Toggle Visibility
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    // 2. Login Form Submission Handler
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const btnLogin = document.getElementById('btn-login');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate inputs
            const emailCheck = Validation.validateEmail(email);
            if (!emailCheck.isValid) {
                Utils.showToast(emailCheck.message, 'error');
                return;
            }

            const passwordCheck = Validation.validateRequired(password, 'Password');
            if (!passwordCheck.isValid) {
                Utils.showToast(passwordCheck.message, 'error');
                return;
            }

            // Disable button during mock processing
            btnLogin.disabled = true;
            btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

            setTimeout(() => {
                const response = API.login(email, password);
                
                if (response.success) {
                    Utils.setCurrentUser(response.user);
                    Utils.showToast('Login successful! Redirecting...', 'success');
                    
                    setTimeout(() => {
                        if (response.user.role === 'seeker') {
                            window.location.href = 'service-seeker.html';
                        } else {
                            window.location.href = 'service-provider.html';
                        }
                    }, 1000);
                } else {
                    Utils.showToast(response.message, 'error');
                    btnLogin.disabled = false;
                    btnLogin.textContent = 'Log In';
                }
            }, 800);
        });
    }

    // 3. Google Login Mock
    const btnGoogleLogin = document.getElementById('btn-google-login');
    if (btnGoogleLogin) {
        btnGoogleLogin.addEventListener('click', () => {
            Utils.showToast('Signing in with Google...', 'info');
            setTimeout(() => {
                // Login with default seeker
                const response = API.login('seeker@example.com', 'Password123!');
                if (response.success) {
                    Utils.setCurrentUser(response.user);
                    Utils.showToast('Google Sign-in successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'service-seeker.html';
                    }, 800);
                }
            }, 1000);
        });
    }

    // 4. Forgot Password Mock
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (!email) {
                Utils.showToast('Please type your Email Address first, then click Forgot Password.', 'info');
                return;
            }
            
            const emailCheck = Validation.validateEmail(email);
            if (!emailCheck.isValid) {
                Utils.showToast(emailCheck.message, 'error');
                return;
            }

            Utils.showToast(`Reset password link has been sent to ${email}`, 'success');
        });
    }

    // 5. Initialize testimonial slides
    initSlider();
});

// Slider Content Database
const slides = [
    {
        title: "Find Trusted Help, Anywhere Nearby",
        desc: "Connect with verified local professionals for home repairs, maintenance, academic tutoring, and lifestyle services.",
        iconClass: "fa-wrench",
        imgUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&fit=crop&q=80"
    },
    {
        title: "Scale Your Business Easily",
        desc: "List your trade services, manage bookings, communicate with customers, and grow your local reputation with ConnectLocal.",
        iconClass: "fa-chart-line",
        imgUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&fit=crop&q=80"
    },
    {
        title: "Vetted & Secure Services",
        desc: "Background check verifications, upfront transparent prices, secure booking confirmations, and honest community ratings.",
        iconClass: "fa-shield-alt",
        imgUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&fit=crop&q=80"
    }
];

let activeSlideIndex = 0;
let slideInterval;

function initSlider() {
    slideInterval = setInterval(() => {
        let next = (activeSlideIndex + 1) % slides.length;
        switchSlide(next);
    }, 5000);
}

function switchSlide(index) {
    activeSlideIndex = index;
    
    const titleEl = document.getElementById('slider-title');
    const descEl = document.getElementById('slider-desc');
    const iconEl = document.querySelector('.hex-icon-overlay i');
    const avatarEl = document.querySelector('.hex-avatar');
    const dots = document.querySelectorAll('.dot');

    if (!titleEl || !descEl || !iconEl || !avatarEl) return;

    // Fade out effect
    titleEl.style.opacity = 0;
    descEl.style.opacity = 0;
    avatarEl.style.opacity = 0.5;

    setTimeout(() => {
        // Change content
        titleEl.textContent = slides[index].title;
        descEl.textContent = slides[index].desc;
        avatarEl.src = slides[index].imgUrl;
        
        // Icon change
        iconEl.className = `fas ${slides[index].iconClass}`;
        
        // Update Active Dot
        dots.forEach((dot, dIdx) => {
            if (dIdx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Fade in
        titleEl.style.opacity = 1;
        descEl.style.opacity = 1;
        avatarEl.style.opacity = 1;
    }, 200);

    // Reset interval timer when user manually clicks dot
    clearInterval(slideInterval);
    initSlider();
}
window.switchSlide = switchSlide;
