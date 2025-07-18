// Redirect to auth.html for login/register actions
function login() {
    window.location.href = 'auth.html';
}

function register() {
    window.location.href = 'auth.html#signup-step1';
}

function resetPassword() {
    window.location.href = 'auth.html';
}

// Profile management
function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const user = JSON.parse(localStorage.getItem('auth_user'));

    if (user && name && email) {
        user.name = name;
        user.email = email;
        localStorage.setItem('auth_user', JSON.stringify(user));
        alert('Profile updated successfully!');
    } else {
        alert('Please fill all fields or log in first.');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('auth_user');
    window.location.href = 'auth.html';
}

// Initialize profile data
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('auth_user'));
    if (user) {
        document.getElementById('profile-name').value = user.firstName + ' ' + (user.lastName || '');
        document.getElementById('profile-email').value = user.email;
    }
});

// Validation utilities
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}