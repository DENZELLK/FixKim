// Navigation function
function showSection(sectionId) {
    const user = JSON.parse(localStorage.getItem('auth_user'));
    if (!user && sectionId !== 'login') {
        alert('Please log in to access this section.');
        login();
        return;
    }

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.classList.remove('hidden');
    } else {
        console.warn(`Section ${sectionId}-section not found`);
    }
    if (sectionId === 'submissions') loadSubmissions();
    if (sectionId === 'programs') loadPrograms();
    if (sectionId === 'notifications') loadNotifications();
}

// Initialize app with authentication check
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('auth_user'));
    if (!user) {
        showSection('login');
    } else {
        showSection('profile');
        document.getElementById('profile-name').value = user.firstName + ' ' + (user.lastName || '');
        document.getElementById('profile-email').value = user.email;
    }
});

// Export function for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showSection };
}