function loadSubmissions() {
    const submissionsSection = document.getElementById('submissions-section');
    const submissionsList = document.getElementById('submissions-list');
    
    if (!submissionsList) {
        console.error('Submissions list element not found');
        return;
    }

    if (!isAuthenticated()) {
        alert('Please log in to view your submissions.');
        login();
        return;
    }

    // Clear existing submissions
    submissionsList.innerHTML = '';

    // Get all user submissions from different categories
    const allSubmissions = [
        ...(JSON.parse(localStorage.getItem('issues') || '[]')).map(item => ({
            ...item,
            type: 'issue',
            icon: getIssueIcon(item.category),
            color: getSubmissionColor('issue')
        })),
        ...(JSON.parse(localStorage.getItem('applications') || '[]')).map(item => ({
            ...item,
            type: 'application',
            icon: 'file-alt',
            color: getSubmissionColor('application')
        })),
        ...(JSON.parse(localStorage.getItem('reports') || '[]')).map(item => ({
            ...item,
            type: 'report',
            icon: 'flag',
            color: getSubmissionColor('report')
        }))
    ];

    // Filter to only show current user's submissions
    const userSubmissions = allSubmissions.filter(sub => 
        sub.userId === JSON.parse(localStorage.getItem('auth_user')).id
    );

    if (userSubmissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-2xl mb-2"></i>
                <p>No submissions yet</p>
                <button onclick="location.href='#report'" class="text-[#861703] hover:text-[#6a1202] mt-2 text-sm">
                    Make your first submission
                </button>
            </div>`;
        return;
    }

    // Sort by date (newest first)
    userSubmissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Render submissions
    userSubmissions.forEach(submission => {
        const submissionEl = document.createElement('div');
        submissionEl.className = `submission-item bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition mb-3`;
        submissionEl.style.borderLeftColor = submission.color;
        
        const date = new Date(submission.timestamp);
        const formattedDate = date.toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-ZA', {
            hour: '2-digit',
            minute: '2-digit'
        });

        submissionEl.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-start space-x-3 flex-1">
                    <div class="mt-1" style="color: ${submission.color}">
                        <i class="fas fa-${submission.icon} text-lg"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800">
                            ${getSubmissionTitle(submission)}
                        </h3>
                        <p class="text-gray-600 text-sm mt-1">
                            ${submission.description || submission.message || 'No description'}
                        </p>
                        <div class="flex flex-wrap items-center gap-2 mt-2">
                            <span class="${getStatusClass(submission)} text-xs px-2 py-1 rounded-full">
                                <i class="${getStatusIcon(submission.status)} mr-1"></i>
                                ${submission.status}
                            </span>
                            <span class="text-xs text-gray-500">
                                <i class="far fa-clock mr-1"></i> ${formattedDate} at ${formattedTime}
                            </span>
                            ${submission.reference ? `
                            <span class="text-xs text-gray-500">
                                <i class="fas fa-hashtag mr-1"></i> ${submission.reference}
                            </span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    ${submission.status === 'Reported' ? `
                    <button onclick="endorseSubmission('${submission.type}', '${submission.id}')" 
                        class="text-gray-400 hover:text-[#861703]" title="Endorse">
                        <i class="fas fa-thumbs-up"></i>
                    </button>` : ''}
                    <button onclick="viewSubmissionDetails('${submission.type}', '${submission.id}')" 
                        class="text-gray-400 hover:text-gray-600" title="View Details">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            ${submission.photo ? `
            <div class="mt-3">
                <img src="${submission.photo}" 
                    class="w-full h-32 object-cover rounded-lg cursor-pointer" 
                    alt="Submission photo"
                    onclick="viewSubmissionPhoto('${submission.photo}')">
            </div>` : ''}
        `;

        submissionsList.appendChild(submissionEl);
    });
}

// Helper functions
function getSubmissionTitle(submission) {
    const titles = {
        'issue': `${submission.category} Report`,
        'application': `${submission.programName || 'Program'} Application`,
        'report': 'Service Report'
    };
    return titles[submission.type] || 'Submission';
}

function getSubmissionColor(type) {
    const colors = {
        'issue': '#861703',    // Maroon
        'application': '#1a5c1a', // Dark green
        'report': '#2563eb',   // Blue
        'default': '#861703'
    };
    return colors[type] || colors['default'];
}

function getIssueIcon(category) {
    const icons = {
        'pothole': 'road',
        'water': 'tint',
        'electricity': 'bolt',
        'sanitation': 'trash',
        'default': 'exclamation-triangle'
    };
    return icons[category.toLowerCase()] || icons['default'];
}

function getStatusClass(submission) {
    const status = submission.status ? submission.status.toLowerCase() : '';
    const classes = {
        'completed': 'bg-green-100 text-green-800',
        'resolved': 'bg-green-100 text-green-800',
        'approved': 'bg-green-100 text-green-800',
        'reported': 'bg-blue-100 text-blue-800',
        'under review': 'bg-yellow-100 text-yellow-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'rejected': 'bg-red-100 text-red-800',
        'default': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes['default'];
}

function getStatusIcon(status) {
    const icons = {
        'completed': 'fa-check-circle',
        'resolved': 'fa-check-circle',
        'approved': 'fa-check-circle',
        'reported': 'fa-flag',
        'under review': 'fa-hourglass-half',
        'pending': 'fa-hourglass-half',
        'rejected': 'fa-times-circle',
        'default': 'fa-info-circle'
    };
    return icons[status] || icons['default'];
}

function endorseSubmission(type, id) {
    if (!isAuthenticated()) {
        alert('Please log in to endorse submissions.');
        login();
        return;
    }

    // Implementation depends on your data structure
    alert(`Endorsing ${type} submission ${id}`);
    // Add your endorsement logic here
}

function viewSubmissionDetails(type, id) {
    // Implementation depends on your data structure
    alert(`Viewing details for ${type} submission ${id}`);
    // Add your details view logic here
}

function viewSubmissionPhoto(photoUrl) {
    // Implementation would show the photo in a modal
    alert(`Viewing photo: ${photoUrl}`);
}

// Initialize when section becomes visible
const submissionsObserver = new MutationObserver(() => {
    if (document.getElementById('submissions-section').classList.contains('hidden') === false) {
        loadSubmissions();
    }
});
submissionsObserver.observe(document.getElementById('submissions-section'), { 
    attributes: true, 
    attributeFilter: ['class'] 
});