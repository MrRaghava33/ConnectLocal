/**
 * ConnectLocal Signup Script
 */

let selectedRole = 'seeker'; // Default role

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if role is pre-selected via query string (e.g. ?role=provider)
    const urlParams = new URLSearchParams(window.location.search);
    const preRole = urlParams.get('role');
    if (preRole === 'provider' || preRole === 'seeker') {
        selectRole(preRole);
    }

    // Password toggle for confirmPassword field
    const toggleConfirm = document.getElementById('toggle-confirm-password');
    const confirmInput = document.getElementById('confirmPassword');

    if (toggleConfirm && confirmInput) {
        toggleConfirm.addEventListener('click', () => {
            const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmInput.setAttribute('type', type);
            
            // Toggle icon classes
            toggleConfirm.classList.toggle('fa-eye');
            toggleConfirm.classList.toggle('fa-eye-slash');
        });
    }


    // 2. Step 1 -> Step 2 transition
    const btnContinue = document.getElementById('btn-step1-continue');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const providerFields = document.querySelectorAll('.provider-field');

    function goToStep2() {
        if (!step1 || !step2) return;
        step1.style.display = 'none';
        step2.style.display = 'flex';
        step2.classList.add('slide-in');

        // Render provider specific fields
        if (selectedRole === 'provider') {
            providerFields.forEach(el => {
                el.style.display = el.classList.contains('form-row') ? 'grid' : 'block';
                const inputEls = el.querySelectorAll('input, select');
                inputEls.forEach(inputEl => inputEl.required = true);
            });
        } else {
            providerFields.forEach(el => {
                el.style.display = 'none';
                const inputEls = el.querySelectorAll('input, select');
                inputEls.forEach(inputEl => {
                    inputEl.required = false;
                    inputEl.value = '';
                });
            });
        }
    }
    window.goToStep2 = goToStep2;

    if (btnContinue) {
        btnContinue.addEventListener('click', goToStep2);
    }

    // Keydown listener for Enter key in Step 1
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && step1 && step1.style.display !== 'none') {
            e.preventDefault();
            goToStep2();
        }
    });

    // 3. Step 2 -> Step 1 Back Navigation
    const btnBack = document.getElementById('btn-back-step1');
    if (btnBack && step1 && step2) {
        btnBack.addEventListener('click', () => {
            step2.style.display = 'none';
            step2.classList.remove('slide-in');
            step1.style.display = 'flex';
        });
    }

    // 4. Form Submission Handler
    const signupForm = document.getElementById('signup-form');
    const btnSignup = document.getElementById('btn-signup');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsChecked = document.getElementById('terms').checked;

            // Validate details
            const nameCheck = Validation.validateRequired(fullName, 'Full Name');
            if (!nameCheck.isValid) {
                Utils.showToast(nameCheck.message, 'error');
                return;
            }

            const emailCheck = Validation.validateEmail(email);
            if (!emailCheck.isValid) {
                Utils.showToast(emailCheck.message, 'error');
                return;
            }

            const phoneCheck = Validation.validatePhone(phone);
            if (!phoneCheck.isValid) {
                Utils.showToast(phoneCheck.message, 'error');
                return;
            }

            // Category & location for providers
            let category = '';
            let location = '';
            if (selectedRole === 'provider') {
                category = document.getElementById('category').value;
                location = document.getElementById('location').value.trim();

                const categoryCheck = Validation.validateRequired(category, 'Service Category');
                if (!categoryCheck.isValid) {
                    Utils.showToast('Please select your trade category.', 'error');
                    return;
                }

                const locationCheck = Validation.validateRequired(location, 'Service Area / Location');
                if (!locationCheck.isValid) {
                    Utils.showToast('Please specify your Service Area / Location.', 'error');
                    return;
                }
            }

            const passwordCheck = Validation.validatePassword(password);
            if (!passwordCheck.isValid) {
                Utils.showToast(passwordCheck.message, 'error');
                return;
            }

            const matchCheck = Validation.validatePasswordMatch(password, confirmPassword);
            if (!matchCheck.isValid) {
                Utils.showToast(matchCheck.message, 'error');
                return;
            }

            if (!termsChecked) {
                Utils.showToast('You must agree to the Terms & Conditions to sign up.', 'error');
                return;
            }

            // Submit
            btnSignup.disabled = true;
            btnSignup.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

            // Construct user payload
            const userData = {
                name: fullName,
                email: email,
                phone: phone,
                password: password,
                role: selectedRole
            };

            if (selectedRole === 'provider') {
                userData.category = category;
                userData.location = location + ' (0.0 miles)'; // Current area
                userData.title = `Local ${category}`;
                // Set sample rates depending on category
                let defaultRate = 50;
                if (category === 'Electrician') defaultRate = 80;
                else if (category === 'Plumber') defaultRate = 75;
                else if (category === 'Tutor') defaultRate = 40;
                else if (category === 'Cleaning') defaultRate = 35;
                else if (category === 'Gardening') defaultRate = 45;
                userData.rate = defaultRate;
            }

            setTimeout(() => {
                const response = API.register(userData);
                
                if (response.success) {
                    Utils.setCurrentUser(response.user);
                    Utils.showToast('Registration successful! Opening your Dashboard...', 'success');
                    
                    setTimeout(() => {
                        if (selectedRole === 'seeker') {
                            window.location.href = 'service-seeker.html';
                        } else {
                            window.location.href = 'service-provider.html';
                        }
                    }, 1000);
                } else {
                    Utils.showToast(response.message, 'error');
                    btnSignup.disabled = false;
                    btnSignup.textContent = 'Create Account';
                }
            }, 1000);
        });
    }
});

/**
 * Handle role choice card clicking
 * @param {'seeker' | 'provider'} role 
 */
function selectRole(role) {
    selectedRole = role;
    
    // Toggle active classes on cards
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
        if (card.dataset.role === role) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}
window.selectRole = selectRole;
