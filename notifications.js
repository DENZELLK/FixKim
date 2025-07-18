function loadNotifications() {
    const notificationsList = document.getElementById('notifications-list');
    const markAllReadBtn = document.getElementById('mark-all-read');
    
    if (!notificationsList) {
        console.error('Notifications list element not found');
        return;
    }

    // Clear the list first
    notificationsList.innerHTML = '';

    // Get notifications from localStorage with proper error handling
    let notifications = [];
    try {
        notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    } catch (error) {
        console.error('Error parsing notifications:', error);
        notifications = [];
    }

    // Check if notifications exist and is an array
    if (!Array.isArray(notifications)) {
        console.warn('Notifications data is not an array, resetting...');
        notifications = [];
    }

    // Add mock data if empty (for demonstration)
    if (notifications.length === 0) {
        notifications = [
            {
                id: Date.now(),
                type: 'pothole',
                message: 'Pothole report on Main Street has been resolved',
                date: new Date().toISOString(),
                read: false,
                status: 'Completed'
            },
            {
                id: Date.now() - 86400000, // Yesterday
                type: 'housing',
                message: 'Your housing application status has been updated to "Under Review"',
                date: new Date(Date.now() - 86400000).toISOString(),
                read: false,
                status: 'Under Review'
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    // Handle empty state
    if (notifications.length === 0) {
        notificationsList.innerHTML = `
            <li class="text-center py-8 text-gray-500">
                <i class="fas fa-bell-slash text-2xl mb-2"></i>
                <p>No notifications yet</p>
            </li>`;
        if (markAllReadBtn) markAllReadBtn.classList.add('hidden');
        return;
    }

    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render notifications
    notifications.forEach(notification => {
        const li = document.createElement('li');
        li.className = `p-4 rounded-lg border-l-4 ${notification.read ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition cursor-pointer`;
        li.style.borderLeftColor = getNotificationColor(notification.type);
        
        const timestamp = new Date(notification.date).toLocaleString('en-ZA', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        li.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-gray-800">${notification.type === 'application' ? 'Application Update' : 'Service Report'}</h3>
                    <p class="text-gray-600 text-sm mt-1">${notification.message}</p>
                    <div class="flex items-center mt-2">
                        <span class="${getStatusClass(notification)} text-xs px-2 py-1 rounded-full">
                            ${notification.status || 'New'}
                        </span>
                        <span class="text-gray-500 text-xs ml-2">${timestamp}</span>
                    </div>
                </div>
                ${notification.read ? '' : '<span class="w-2 h-2 bg-[#861703] rounded-full mt-1.5"></span>'}
            </div>
        `;

        li.addEventListener('click', () => {
            markNotificationAsRead(notification.id);
            // Add your click handler logic here
        });

        notificationsList.appendChild(li);
    });

    // Mark all as read functionality
    if (markAllReadBtn) {
        markAllReadBtn.classList.remove('hidden');
        markAllReadBtn.addEventListener('click', () => {
            notifications = notifications.map(n => ({ ...n, read: true }));
            localStorage.setItem('notifications', JSON.stringify(notifications));
            loadNotifications(); // Refresh the list
        });
    }
}

// Helper functions (keep these exactly as they were)
function isAuthenticated() {
    return !!JSON.parse(localStorage.getItem('auth_user'));
}

function getNotificationColor(type) {
    const colors = {
        'application': '#861703',
        'service': '#1a5c1a',
        'alert': '#2563eb',
        'payment': '#7c3aed'
    };
    return colors[type] || '#861703';
}

function getStatusClass(notification) {
    const status = notification.status ? notification.status.toLowerCase() : '';
    const classes = {
        'completed': 'bg-green-100 text-green-800',
        'approved': 'bg-green-100 text-green-800',
        'rejected': 'bg-red-100 text-red-800',
        'in progress': 'bg-yellow-100 text-yellow-800',
        'submitted': 'bg-blue-100 text-blue-800',
        'default': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes['default'];
}

function markNotificationAsRead(id) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(notifications));
    loadNotifications();
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadNotifications);