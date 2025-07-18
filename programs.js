// Mock program data
const programs = {
    housing: {
        name: "Housing Assistance",
        description: "Government housing assistance and subsidies for low-income families",
        requirements: ["South African ID", "Proof of income", "Proof of residence", "Bank statement"],
        icon: "fa-home",
        color: "bg-[#861703]"
    },
    water: {
        name: "Water Subsidy",
        description: "Financial assistance for water bills for qualifying households",
        requirements: ["South African ID", "Recent water bill", "Proof of income"],
        icon: "fa-tint",
        color: "bg-blue-600"
    },
    youth: {
        name: "Youth Employment",
        description: "Job placement and training program for unemployed youth (18-35 years)",
        requirements: ["South African ID", "Matric certificate", "Proof of unemployment", "CV/resume"],
        icon: "fa-briefcase",
        color: "bg-green-600"
    },
    business: {
        name: "Small Business Grant",
        description: "Funding and support for local entrepreneurs and small businesses",
        requirements: ["South African ID", "Business plan", "Company registration documents", "Financial statements"],
        icon: "fa-store",
        color: "bg-purple-600"
    }
};

// Show application form for specific program
function showApplicationForm(programId) {
    if (!isAuthenticated()) {
        alert('Please log in to apply for programs.');
        login();
        return;
    }

    const program = programs[programId];
    if (!program) return;

    // Set form title
    document.getElementById('application-title').textContent = `Apply for ${program.name}`;
    
    // Set required documents
    const docsList = program.requirements.map(req => `• ${req}`).join('<br>');
    document.getElementById('required-docs').innerHTML = docsList;

    // Show form
    document.getElementById('application-form').classList.remove('hidden');
    document.getElementById('application-status').classList.add('hidden');
    
    // Scroll to form
    document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' });
}

// Hide application form
function hideApplicationForm() {
    document.getElementById('application-form').classList.add('hidden');
}

// Hide status message
function hideStatusMessage() {
    document.getElementById('application-status').classList.add('hidden');
}

// Handle form submission
document.getElementById('program-application-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('applicant-name').value.trim();
    const idNumber = document.getElementById('applicant-id').value.trim();
    const email = document.getElementById('applicant-email').value.trim();
    const phone = document.getElementById('applicant-phone').value.trim();
    const files = document.getElementById('applicant-documents').files;
    const programName = document.getElementById('application-title').textContent.replace('Apply for ', '');
    
    // Validate inputs
    if (!name || !idNumber || !email || !phone || files.length === 0) {
        alert('Please fill in all fields and upload required documents.');
        return;
    }

    if (!isValidSAID(idNumber)) {
        alert('Invalid South African ID number. Must be 13 digits.');
        return;
    }

    // Validate files
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!allowedTypes.includes(file.type)) {
            alert(`File ${file.name} must be PDF, JPG, or PNG format.`);
            return;
        }
        
        if (file.size > maxFileSize) {
            alert(`File ${file.name} exceeds 5MB size limit.`);
            return;
        }
    }

    // Save application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const user = JSON.parse(localStorage.getItem('auth_user'));
    
    const application = {
        id: Date.now(),
        programId: programName.toLowerCase().replace(' ', '-'),
        programName,
        applicantName: name,
        applicantId: idNumber,
        applicantEmail: email,
        applicantPhone: phone,
        status: 'Submitted',
        date: new Date().toISOString(),
        userId: user ? user.id : null,
        documents: Array.from(files).map(file => file.name)
    };
    
    applications.push(application);
    localStorage.setItem('applications', JSON.stringify(applications));

    // Create notification
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
        id: Date.now(),
        type: 'application',
        message: `Application submitted for ${programName}`,
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Show success message
    document.getElementById('application-form').classList.add('hidden');
    document.getElementById('status-message').innerHTML = `
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p class="font-bold">Application Submitted Successfully!</p>
            <p>Your application for <strong>${programName}</strong> has been received.</p>
            <p class="mt-2">Reference Number: <strong>APP-${application.id}</strong></p>
        </div>
        <p class="text-gray-600">We'll contact you at ${email} or ${phone} within 5-7 working days.</p>
    `;
    document.getElementById('application-status').classList.remove('hidden');
    
    // Reset form
    this.reset();
});

// Validate South African ID number
function isValidSAID(id) {
    return id.length === 13 && /^\d{13}$/.test(id);
}

// Check if user is authenticated
function isAuthenticated() {
    return !!JSON.parse(localStorage.getItem('auth_user'));
}

// Redirect to login
function login() {
    window.location.href = 'auth.html';
}

// Load programs when section is shown
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('nav-programs').addEventListener('click', function() {
        if (!isAuthenticated()) {
            alert('Please log in to view programs.');
            login();
        }
    });
});