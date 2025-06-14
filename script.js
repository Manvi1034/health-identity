// Global variables
let currentUser = null;
let userRole = null;
let healthData = {
    patients: {},
    familyAccess: {}
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for existing users in localStorage
    if (localStorage.getItem('healthData')) {
        healthData = JSON.parse(localStorage.getItem('healthData'));
    } else {
        // Initialize with sample data for demo
        initializeSampleData();
    }

    // Setup event listeners
    setupEventListeners();

    // Check if user is already logged in (for demo purposes)
    const urlParams = new URLSearchParams(window.location.search);
    const demoUser = urlParams.get('demoUser');
    
    if (demoUser && healthData.patients[demoUser]) {
        loginUser(demoUser, 'patient');
    }
});

function initializeSampleData() {
    // Sample patient data
    healthData.patients = {
        'patient@example.com': {
            password: 'patient123',
            personalInfo: {
                name: 'John Doe',
                dob: '1985-05-15',
                gender: 'Male',
                bloodGroup: 'A+',
                allergies: 'Penicillin, Peanuts',
                conditions: 'Asthma, Hypertension',
                emergencyContact: {
                    name: 'Jane Doe',
                    phone: '+1 (555) 123-4567',
                    relation: 'Spouse'
                }
            },
            medicalHistory: {
                visits: [
                    {
                        id: 'v1',
                        date: '2023-06-10',
                        doctor: 'Dr. Smith',
                        specialty: 'Cardiology',
                        notes: 'Routine checkup, blood pressure slightly elevated'
                    },
                    {
                        id: 'v2',
                        date: '2023-04-15',
                        doctor: 'Dr. Johnson',
                        specialty: 'Pulmonology',
                        notes: 'Asthma follow-up, adjusted inhaler dosage'
                    }
                ],
                medications: [
                    {
                        id: 'm1',
                        name: 'Lisinopril',
                        dosage: '10mg daily',
                        startDate: '2023-01-01',
                        endDate: '',
                        purpose: 'Hypertension'
                    },
                    {
                        id: 'm2',
                        name: 'Albuterol',
                        dosage: 'As needed',
                        startDate: '2022-06-01',
                        endDate: '',
                        purpose: 'Asthma'
                    }
                ],
                tests: [
                    {
                        id: 't1',
                        name: 'Complete Blood Count',
                        date: '2023-06-08',
                        fileName: 'cbc_results.pdf',
                        notes: 'All values within normal range'
                    }
                ]
            }
        }
    };

    // Sample family access
    healthData.familyAccess = {
        'family@example.com': {
            patientEmail: 'patient@example.com',
            accessLevel: 'family'
        }
    };

    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
}

function setupEventListeners() {
    // Login/Register navigation
    document.getElementById('show-register').addEventListener('click', showRegisterPage);
    document.getElementById('show-login').addEventListener('click', showLoginPage);
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    // Navigation links
    document.getElementById('nav-dashboard').addEventListener('click', showDashboard);
    document.getElementById('nav-health-card').addEventListener('click', showHealthCard);
    document.getElementById('nav-medical-history').addEventListener('click', showMedicalHistory);
    document.getElementById('nav-settings').addEventListener('click', showSettings);
    
    // Quick action buttons
    document.getElementById('quick-view-card').addEventListener('click', showHealthCard);
    document.getElementById('quick-add-medication').addEventListener('click', showAddMedicationModal);
    document.getElementById('quick-share-card').addEventListener('click', showQRCodeModal);
    
    // Health card actions
    document.getElementById('edit-health-card-btn').addEventListener('click', showEditHealthCard);
    document.getElementById('cancel-edit-health-card').addEventListener('click', cancelEditHealthCard);
    document.getElementById('print-health-card-btn').addEventListener('click', printHealthCard);
    document.getElementById('health-card-form').addEventListener('submit', saveHealthCard);
    
    // Medical history actions
    document.getElementById('add-visit-btn').addEventListener('click', showAddVisitModal);
    document.getElementById('save-visit-btn').addEventListener('click', saveVisit);
    document.getElementById('save-medication-btn').addEventListener('click', saveMedication);
    document.getElementById('upload-test-btn').addEventListener('click', showUploadTestModal);
    document.getElementById('save-test-btn').addEventListener('click', saveTest);
    
    // QR code actions
    document.getElementById('generate-qr-btn').addEventListener('click', generateQRCode);
    document.getElementById('download-pdf-btn').addEventListener('click', downloadHealthCardPDF);
    document.getElementById('download-qr-btn').addEventListener('click', downloadQRCode);
    document.getElementById('share-link-btn').addEventListener('click', copyShareLink);
    
    // Settings actions
    document.getElementById('account-info-form').addEventListener('submit', updateAccountInfo);
    document.getElementById('change-password-form').addEventListener('submit', changePassword);
    document.getElementById('add-family-form').addEventListener('submit', addFamilyMember);
    document.getElementById('delete-account-btn').addEventListener('click', confirmDeleteAccount);
    document.getElementById('confirm-delete-account').addEventListener('click', deleteAccount);
    
    // Emergency actions
    document.getElementById('em-call-contact').addEventListener('click', callEmergencyContact);
}

// Authentication functions
function showRegisterPage(e) {
    e.preventDefault();
    document.getElementById('login-page').classList.add('d-none');
    document.getElementById('register-page').classList.remove('d-none');
}

function showLoginPage(e) {
    e.preventDefault();
    document.getElementById('register-page').classList.add('d-none');
    document.getElementById('login-page').classList.remove('d-none');
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    
    // Validate inputs
    if (!email || !password || !role) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    // Check if user exists and password matches
    if (role === 'patient') {
        if (healthData.patients[email] && healthData.patients[email].password === password) {
            loginUser(email, role);
        } else {
            showAlert('Invalid email or password', 'danger');
        }
    } else if (role === 'family') {
        if (healthData.familyAccess[email] && healthData.patients[healthData.familyAccess[email].patientEmail].password === password) {
            loginUser(email, role);
        } else {
            showAlert('Invalid email or password', 'danger');
        }
    } else if (role === 'emergency') {
        // Emergency access doesn't require login, just show emergency view
        showEmergencyView();
        return;
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'danger');
        return;
    }
    
    // Check if user already exists
    if (healthData.patients[email]) {
        showAlert('Email already registered', 'danger');
        return;
    }
    
    // Create new patient
    healthData.patients[email] = {
        password: password,
        personalInfo: {
            name: name,
            dob: '',
            gender: '',
            bloodGroup: '',
            allergies: '',
            conditions: '',
            emergencyContact: {
                name: '',
                phone: '',
                relation: ''
            }
        },
        medicalHistory: {
            visits: [],
            medications: [],
            tests: []
        }
    };
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Login the new user
    loginUser(email, 'patient');
    
    showAlert('Registration successful! Please complete your health profile.', 'success');
}

function loginUser(email, role) {
    currentUser = email;
    userRole = role;
    
    // Hide login/register pages, show app
    document.getElementById('login-page').classList.add('d-none');
    document.getElementById('register-page').classList.add('d-none');
    document.getElementById('app-container').classList.remove('d-none');
    
    // Update UI based on role
    document.getElementById('user-role-display').textContent = `Logged in as ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    
    if (role === 'patient') {
        // Full access
        document.getElementById('nav-settings').classList.remove('d-none');
        document.getElementById('quick-add-medication').classList.remove('d-none');
        document.getElementById('add-visit-btn').classList.remove('d-none');
        document.getElementById('upload-test-btn').classList.remove('d-none');
        document.getElementById('edit-health-card-btn').classList.remove('d-none');
    } else if (role === 'family') {
        // Read-only access
        document.getElementById('nav-settings').classList.add('d-none');
        document.getElementById('quick-add-medication').classList.add('d-none');
        document.getElementById('add-visit-btn').classList.add('d-none');
        document.getElementById('upload-test-btn').classList.add('d-none');
        document.getElementById('edit-health-card-btn').classList.add('d-none');
    } else if (role === 'emergency') {
        // Limited access
        showEmergencyView();
        return;
    }
    
    // Load user data and show dashboard
    loadUserData();
    showDashboard();
}

function logoutUser() {
    currentUser = null;
    userRole = null;
    
    // Hide app, show login page
    document.getElementById('app-container').classList.add('d-none');
    document.getElementById('login-page').classList.remove('d-none');
    
    // Reset forms
    document.getElementById('login-form').reset();
}

// View navigation functions
function showDashboard() {
    hideAllViews();
    document.getElementById('dashboard-view').classList.remove('d-none');
    updateDashboard();
}

function showHealthCard() {
    hideAllViews();
    document.getElementById('health-card-view').classList.remove('d-none');
    updateHealthCardView();
}

function showEditHealthCard() {
    hideAllViews();
    document.getElementById('edit-health-card-view').classList.remove('d-none');
    populateEditHealthCardForm();
}

function showMedicalHistory() {
    hideAllViews();
    document.getElementById('medical-history-view').classList.remove('d-none');
    updateMedicalHistoryView();
}

function showSettings() {
    hideAllViews();
    document.getElementById('settings-view').classList.remove('d-none');
    updateSettingsView();
}

function showEmergencyView() {
    hideAllViews();
    document.getElementById('emergency-view').classList.remove('d-none');
    
    // Determine which patient's data to show
    let patientEmail = currentUser;
    if (userRole === 'family') {
        patientEmail = healthData.familyAccess[currentUser].patientEmail;
    }
    
    const patient = healthData.patients[patientEmail];
    const personalInfo = patient.personalInfo;
    
    // Update emergency view with limited info
    document.getElementById('em-blood-group').textContent = personalInfo.bloodGroup || 'Not provided';
    document.getElementById('em-allergies').textContent = personalInfo.allergies || 'None';
    document.getElementById('em-conditions').textContent = personalInfo.conditions || 'None';
    
    // Emergency contact info
    document.getElementById('em-contact-name').textContent = personalInfo.emergencyContact.name || 'Not provided';
    document.getElementById('em-contact-phone').textContent = personalInfo.emergencyContact.phone || 'Not provided';
    document.getElementById('em-contact-relation').textContent = personalInfo.emergencyContact.relation || 'Not provided';
}

function hideAllViews() {
    document.getElementById('dashboard-view').classList.add('d-none');
    document.getElementById('health-card-view').classList.add('d-none');
    document.getElementById('edit-health-card-view').classList.add('d-none');
    document.getElementById('medical-history-view').classList.add('d-none');
    document.getElementById('settings-view').classList.add('d-none');
    document.getElementById('emergency-view').classList.add('d-none');
}

// Data loading and updating functions
function loadUserData() {
    // Determine which patient's data to load
    let patientEmail = currentUser;
    if (userRole === 'family') {
        patientEmail = healthData.familyAccess[currentUser].patientEmail;
    }
    
    // This function primarily sets up the UI, actual data loading happens in view-specific functions
    return healthData.patients[patientEmail];
}

function updateDashboard() {
    const patient = loadUserData();
    const personalInfo = patient.personalInfo;
    const medicalHistory = patient.medicalHistory;
    
    // Update summary information
    document.getElementById('allergies-summary').textContent = personalInfo.allergies || 'None recorded';
    document.getElementById('conditions-summary').textContent = personalInfo.conditions || 'None recorded';
    
    // Update last visit
    if (medicalHistory.visits.length > 0) {
        const lastVisit = medicalHistory.visits.reduce((latest, visit) => {
            return new Date(visit.date) > new Date(latest.date) ? visit : latest;
        }, medicalHistory.visits[0]);
        
        document.getElementById('last-visit-summary').textContent = 
            `${formatDate(lastVisit.date)} with ${lastVisit.doctor}`;
    } else {
        document.getElementById('last-visit-summary').textContent = 'No visits recorded';
    }
    
    // Update recent activity
    updateRecentActivityList();
    
    // Generate QR code if not already present
    if (!document.getElementById('qr-code-container').hasChildNodes()) {
        generateQRCode();
    }
}

function updateRecentActivityList() {
    const patient = loadUserData();
    const medicalHistory = patient.medicalHistory;
    const activityList = document.getElementById('recent-activity-list');
    activityList.innerHTML = '';
    
    // Combine all activities with their types
    const allActivities = [];
    
    medicalHistory.visits.forEach(visit => {
        allActivities.push({
            type: 'visit',
            date: visit.date,
            data: visit
        });
    });
    
    medicalHistory.medications.forEach(med => {
        allActivities.push({
            type: 'medication',
            date: med.startDate,
            data: med
        });
    });
    
    medicalHistory.tests.forEach(test => {
        allActivities.push({
            type: 'test',
            date: test.date,
            data: test
        });
    });
    
    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display only the 5 most recent activities
    const recentActivities = allActivities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<div class="text-center text-muted py-3">No recent activity</div>';
        return;
    }
    
    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'list-group-item activity-item';
        
        if (activity.type === 'visit') {
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>Doctor Visit</strong>
                        <div>${activity.data.doctor} (${activity.data.specialty || 'No specialty'})</div>
                        <small class="activity-date">${formatDate(activity.date)}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary view-visit-btn" data-id="${activity.data.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (activity.type === 'medication') {
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>Medication Added</strong>
                        <div>${activity.data.name} (${activity.data.dosage})</div>
                        <small class="activity-date">${formatDate(activity.date)}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary view-medication-btn" data-id="${activity.data.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (activity.type === 'test') {
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <strong>Test Result</strong>
                        <div>${activity.data.name}</div>
                        <small class="activity-date">${formatDate(activity.date)}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary view-test-btn" data-id="${activity.data.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        activityList.appendChild(activityItem);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-visit-btn').forEach(btn => {
        btn.addEventListener('click', () => viewVisitDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.view-medication-btn').forEach(btn => {
        btn.addEventListener('click', () => viewMedicationDetails(btn.dataset.id));
    });
    
    document.querySelectorAll('.view-test-btn').forEach(btn => {
        btn.addEventListener('click', () => viewTestDetails(btn.dataset.id));
    });
}

function updateHealthCardView() {
    const patient = loadUserData();
    const personalInfo = patient.personalInfo;
    
    // Update health card display
    document.getElementById('hc-name').textContent = personalInfo.name || 'Not provided';
    document.getElementById('hc-dob').textContent = personalInfo.dob ? formatDate(personalInfo.dob) : 'Not provided';
    document.getElementById('hc-gender').textContent = personalInfo.gender || 'Not provided';
    document.getElementById('hc-blood-group').textContent = personalInfo.bloodGroup || 'Not provided';
    document.getElementById('hc-allergies').textContent = personalInfo.allergies || 'None';
    document.getElementById('hc-conditions').textContent = personalInfo.conditions || 'None';
    
    // Emergency contact
    document.getElementById('hc-emergency-name').textContent = personalInfo.emergencyContact.name || 'Not provided';
    document.getElementById('hc-emergency-phone').textContent = personalInfo.emergencyContact.phone || 'Not provided';
    document.getElementById('hc-emergency-relation').textContent = personalInfo.emergencyContact.relation || 'Not provided';
}

function populateEditHealthCardForm() {
    const patient = loadUserData();
    const personalInfo = patient.personalInfo;
    
    // Populate form fields
    document.getElementById('edit-name').value = personalInfo.name || '';
    document.getElementById('edit-dob').value = personalInfo.dob || '';
    document.getElementById('edit-gender').value = personalInfo.gender || '';
    document.getElementById('edit-blood-group').value = personalInfo.bloodGroup || '';
    document.getElementById('edit-allergies').value = personalInfo.allergies || '';
    document.getElementById('edit-conditions').value = personalInfo.conditions || '';
    
    // Emergency contact
    document.getElementById('edit-emergency-name').value = personalInfo.emergencyContact.name || '';
    document.getElementById('edit-emergency-phone').value = personalInfo.emergencyContact.phone || '';
    document.getElementById('edit-emergency-relation').value = personalInfo.emergencyContact.relation || '';
}

function updateMedicalHistoryView() {
    updateVisitsTable();
    updateMedicationsTable();
    updateTestsTable();
}

function updateVisitsTable() {
    const patient = loadUserData();
    const visits = patient.medicalHistory.visits;
    const tableBody = document.getElementById('visits-table-body');
    tableBody.innerHTML = '';
    
    if (visits.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-3">No visits recorded</td>
            </tr>
        `;
        return;
    }
    
    // Sort visits by date (newest first)
    visits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    visits.forEach(visit => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(visit.date)}</td>
            <td>${visit.doctor}</td>
            <td>${visit.notes ? visit.notes.substring(0, 50) + (visit.notes.length > 50 ? '...' : '') : ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-visit-btn" data-id="${visit.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${userRole === 'patient' ? `
                <button class="btn btn-sm btn-outline-danger delete-visit-btn" data-id="${visit.id}">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-visit-btn').forEach(btn => {
        btn.addEventListener('click', () => viewVisitDetails(btn.dataset.id));
    });
    
    if (userRole === 'patient') {
        document.querySelectorAll('.delete-visit-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteVisit(btn.dataset.id));
        });
    }
}

function updateMedicationsTable() {
    const patient = loadUserData();
    const medications = patient.medicalHistory.medications;
    const tableBody = document.getElementById('medications-table-body');
    tableBody.innerHTML = '';
    
    if (medications.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">No medications recorded</td>
            </tr>
        `;
        return;
    }
    
    // Sort medications by start date (newest first)
    medications.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    medications.forEach(med => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${med.name}</td>
            <td>${med.dosage}</td>
            <td>${formatDate(med.startDate)}</td>
            <td>${med.endDate ? formatDate(med.endDate) : 'Ongoing'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-medication-btn" data-id="${med.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${userRole === 'patient' ? `
                <button class="btn btn-sm btn-outline-danger delete-medication-btn" data-id="${med.id}">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-medication-btn').forEach(btn => {
        btn.addEventListener('click', () => viewMedicationDetails(btn.dataset.id));
    });
    
    if (userRole === 'patient') {
        document.querySelectorAll('.delete-medication-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMedication(btn.dataset.id));
        });
    }
}

function updateTestsTable() {
    const patient = loadUserData();
    const tests = patient.medicalHistory.tests;
    const tableBody = document.getElementById('tests-table-body');
    tableBody.innerHTML = '';
    
    if (tests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-3">No test results recorded</td>
            </tr>
        `;
        return;
    }
    
    // Sort tests by date (newest first)
    tests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tests.forEach(test => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${test.name}</td>
            <td>${formatDate(test.date)}</td>
            <td>
                <a href="#" class="test-file-link view-test-btn" data-id="${test.id}">
                    ${test.fileName || 'View'}
                </a>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-test-btn" data-id="${test.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${userRole === 'patient' ? `
                <button class="btn btn-sm btn-outline-danger delete-test-btn" data-id="${test.id}">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-test-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            viewTestDetails(btn.dataset.id);
        });
    });
    
    if (userRole === 'patient') {
        document.querySelectorAll('.delete-test-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTest(btn.dataset.id));
        });
    }
}

function updateSettingsView() {
    const patient = loadUserData();
    
    // Update account info
    document.getElementById('settings-email').value = currentUser;
    document.getElementById('settings-name').value = patient.personalInfo.name || '';
    
    // Update family access list
    updateFamilyAccessList();
}

function updateFamilyAccessList() {
    const familyList = document.getElementById('family-access-list');
    familyList.innerHTML = '';
    
    // Find all family members with access to this patient
    const familyMembers = Object.entries(healthData.familyAccess)
        .filter(([email, data]) => data.patientEmail === currentUser);
    
    if (familyMembers.length === 0) {
        familyList.innerHTML = '<div class="text-muted small">No family members have access</div>';
        return;
    }
    
    familyMembers.forEach(([email, data]) => {
        const memberItem = document.createElement('div');
        memberItem.className = 'family-member-item';
        memberItem.innerHTML = `
            <span class="family-member-email">${email}</span>
            <button class="btn btn-sm btn-outline-danger remove-family-btn" data-email="${email}">
                <i class="fas fa-times"></i>
            </button>
        `;
        familyList.appendChild(memberItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-family-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFamilyMember(btn.dataset.email));
    });
}

// Modal functions
function showAddVisitModal() {
    // Reset form
    document.getElementById('add-visit-form').reset();
    
    // Set default date to today
    document.getElementById('visit-date').valueAsDate = new Date();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addVisitModal'));
    modal.show();
}

function showAddMedicationModal() {
    // Reset form
    document.getElementById('add-medication-form').reset();
    
    // Set default start date to today
    document.getElementById('medication-start-date').valueAsDate = new Date();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addMedicationModal'));
    modal.show();
}

function showUploadTestModal() {
    // Reset form
    document.getElementById('upload-test-form').reset();
    
    // Set default date to today
    document.getElementById('test-date').valueAsDate = new Date();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('uploadTestModal'));
    modal.show();
}

function showQRCodeModal() {
    // Generate QR code if not already present
    if (!document.getElementById('modal-qr-code').hasChildNodes()) {
        generateQRCodeForModal();
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
    modal.show();
}

// Data manipulation functions
function saveHealthCard(e) {
    e.preventDefault();
    
    const patient = loadUserData();
    
    // Update personal info
    patient.personalInfo = {
        name: document.getElementById('edit-name').value,
        dob: document.getElementById('edit-dob').value,
        gender: document.getElementById('edit-gender').value,
        bloodGroup: document.getElementById('edit-blood-group').value,
        allergies: document.getElementById('edit-allergies').value,
        conditions: document.getElementById('edit-conditions').value,
        emergencyContact: {
            name: document.getElementById('edit-emergency-name').value,
            phone: document.getElementById('edit-emergency-phone').value,
            relation: document.getElementById('edit-emergency-relation').value
        }
    };
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Show success message and return to health card view
    showAlert('Health card updated successfully', 'success');
    showHealthCard();
}

function saveVisit() {
    const patient = loadUserData();
    
    // Create new visit object
    const newVisit = {
        id: 'v' + Date.now(),
        date: document.getElementById('visit-date').value,
        doctor: document.getElementById('visit-doctor').value,
        specialty: document.getElementById('visit-specialty').value,
        notes: document.getElementById('visit-notes').value
    };
    
    // Add to visits array
    patient.medicalHistory.visits.push(newVisit);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Close modal and update view
    bootstrap.Modal.getInstance(document.getElementById('addVisitModal')).hide();
    showAlert('Visit added successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function saveMedication() {
    const patient = loadUserData();
    
    // Create new medication object
    const newMedication = {
        id: 'm' + Date.now(),
        name: document.getElementById('medication-name').value,
        dosage: document.getElementById('medication-dosage').value,
        startDate: document.getElementById('medication-start-date').value,
        endDate: document.getElementById('medication-end-date').value || '',
        purpose: document.getElementById('medication-purpose').value || ''
    };
    
    // Add to medications array
    patient.medicalHistory.medications.push(newMedication);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Close modal and update view
    bootstrap.Modal.getInstance(document.getElementById('addMedicationModal')).hide();
    showAlert('Medication added successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function saveTest() {
    const patient = loadUserData();
    const fileInput = document.getElementById('test-file');
    
    if (fileInput.files.length === 0) {
        showAlert('Please select a file to upload', 'danger');
        return;
    }
    
    // In a real app, you would upload the file to a server here
    // For this demo, we'll just store the file name
    const fileName = fileInput.files[0].name;
    
    // Create new test object
    const newTest = {
        id: 't' + Date.now(),
        name: document.getElementById('test-name').value,
        date: document.getElementById('test-date').value,
        fileName: fileName,
        notes: document.getElementById('test-notes').value
    };
    
    // Add to tests array
    patient.medicalHistory.tests.push(newTest);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Close modal and update view
    bootstrap.Modal.getInstance(document.getElementById('uploadTestModal')).hide();
    showAlert('Test results added successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function deleteVisit(id) {
    if (!confirm('Are you sure you want to delete this visit?')) return;
    
    const patient = loadUserData();
    
    // Remove visit from array
    patient.medicalHistory.visits = patient.medicalHistory.visits.filter(visit => visit.id !== id);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Update view
    showAlert('Visit deleted successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function deleteMedication(id) {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    const patient = loadUserData();
    
    // Remove medication from array
    patient.medicalHistory.medications = patient.medicalHistory.medications.filter(med => med.id !== id);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Update view
    showAlert('Medication deleted successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function deleteTest(id) {
    if (!confirm('Are you sure you want to delete this test result?')) return;
    
    const patient = loadUserData();
    
    // Remove test from array
    patient.medicalHistory.tests = patient.medicalHistory.tests.filter(test => test.id !== id);
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Update view
    showAlert('Test result deleted successfully', 'success');
    updateMedicalHistoryView();
    updateDashboard();
}

function viewVisitDetails(id) {
    const patient = loadUserData();
    const visit = patient.medicalHistory.visits.find(v => v.id === id);
    
    if (!visit) return;
    
    // Show details in an alert for simplicity
    // In a real app, you might show a modal with more details
    alert(`
        Doctor Visit Details\n
        Date: ${formatDate(visit.date)}\n
        Doctor: ${visit.doctor}\n
        Specialty: ${visit.specialty || 'Not specified'}\n
        Notes: ${visit.notes || 'No notes'}
    `);
}

function viewMedicationDetails(id) {
    const patient = loadUserData();
    const medication = patient.medicalHistory.medications.find(m => m.id === id);
    
    if (!medication) return;
    
    // Show details in an alert for simplicity
    alert(`
        Medication Details\n
        Name: ${medication.name}\n
        Dosage: ${medication.dosage}\n
        Start Date: ${formatDate(medication.startDate)}\n
        End Date: ${medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}\n
        Purpose: ${medication.purpose || 'Not specified'}
    `);
}

function viewTestDetails(id) {
    const patient = loadUserData();
    const test = patient.medicalHistory.tests.find(t => t.id === id);
    
    if (!test) return;
    
    // Show details in an alert for simplicity
    alert(`
        Test Results\n
        Name: ${test.name}\n
        Date: ${formatDate(test.date)}\n
        File: ${test.fileName}\n
        Notes: ${test.notes || 'No notes'}
    `);
}

// Health card actions
function cancelEditHealthCard() {
    showHealthCard();
}

function printHealthCard() {
    window.print();
}

function generateQRCode() {
    // Clear previous QR code
    document.getElementById('qr-code-container').innerHTML = '';
    
    // Determine which patient's data to use
    let patientEmail = currentUser;
    if (userRole === 'family') {
        patientEmail = healthData.familyAccess[currentUser].patientEmail;
    }
    
    // In a real app, this would generate a link to a public view of the health card
    // For this demo, we'll just use a placeholder link with the patient email
    //const qrData = `${window.location.origin}${window.location.pathname}?emergencyView=true&patient=${patientEmail}`;
    const qrData = JSON.stringify(healthData.patients[patientEmail]);

    // Generate QR code
    new QRCode(document.getElementById('qr-code-container'), {
        text: qrData,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function generateQRCodeForModal() {
    // Clear previous QR code
    document.getElementById('modal-qr-code').innerHTML = '';
    
    // Determine which patient's data to use
    let patientEmail = currentUser;
    if (userRole === 'family') {
        patientEmail = healthData.familyAccess[currentUser].patientEmail;
    }
    
    // In a real app, this would generate a link to a public view of the health card
    // For this demo, we'll just use a placeholder link with the patient email
    //const qrData = `${window.location.origin}${window.location.pathname}?emergencyView=true&patient=${patientEmail}`;
    const qrData = JSON.stringify(healthData.patients[patientEmail]);

    // Generate QR code
    new QRCode(document.getElementById('modal-qr-code'), {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// function downloadHealthCardPDF() {
//     // In a real app, this would generate a PDF of the health card
//     // For this demo, we'll just show an alert
//     //showAlert('PDF download functionality would be implemented in a production app', 'info');
    
//     // Here's how it might work with jsPDF and html2canvas:
    
//     const element = document.getElementById('health-card-display');
//     html2canvas(element).then(canvas => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF();
//         pdf.addImage(imgData, 'PNG', 10, 10);
//         pdf.save('health-card.pdf');
//     });
    
// }

function downloadHealthCardPDF() {
    const element = document.getElementById('health-card-display');
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        // Use jsPDF from the global window object
        const pdf = new window.jspdf.jsPDF();
        // Adjust width/height as needed
        const pdfWidth = 180;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save('health-card.pdf');
    });
}

function downloadQRCode() {
    // In a real app, this would download the QR code as an image
    // For this demo, we'll just show an alert
    showAlert('QR code download functionality would be implemented in a production app', 'info');
}

function copyShareLink() {
    // Determine which patient's data to use
    let patientEmail = currentUser;
    if (userRole === 'family') {
        patientEmail = healthData.familyAccess[currentUser].patientEmail;
    }
    
    // Create share link
    const shareLink = `${window.location.origin}${window.location.pathname}?emergencyView=true&patient=${patientEmail}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
        showAlert('Share link copied to clipboard', 'success');
    }).catch(err => {
        showAlert('Failed to copy link: ' + err, 'danger');
    });
}

// Settings functions
function updateAccountInfo(e) {
    e.preventDefault();
    
    const patient = loadUserData();
    const newName = document.getElementById('settings-name').value;
    
    if (!newName) {
        showAlert('Name cannot be empty', 'danger');
        return;
    }
    
    // Update name
    patient.personalInfo.name = newName;
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Update UI
    updateHealthCardView();
    showAlert('Account information updated successfully', 'success');
}

function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showAlert('New passwords do not match', 'danger');
        return;
    }
    
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters', 'danger');
        return;
    }
    
    const patient = loadUserData();
    
    // Check current password
    if (patient.password !== currentPassword) {
        showAlert('Current password is incorrect', 'danger');
        return;
    }
    
    // Update password
    patient.password = newPassword;
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Clear form and show success message
    document.getElementById('change-password-form').reset();
    showAlert('Password changed successfully', 'success');
}

function addFamilyMember(e) {
    e.preventDefault();
    
    const familyEmail = document.getElementById('family-email').value;
    
    if (!familyEmail) {
        showAlert('Please enter an email address', 'danger');
        return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(familyEmail)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    // Check if email is already a patient
    if (healthData.patients[familyEmail]) {
        showAlert('This email is already registered as a patient', 'danger');
        return;
    }
    
    // Check if email already has access
    if (healthData.familyAccess[familyEmail]) {
        showAlert('This email already has family access', 'danger');
        return;
    }
    
    // Add family access
    healthData.familyAccess[familyEmail] = {
        patientEmail: currentUser,
        accessLevel: 'family'
    };
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Clear form and update view
    document.getElementById('family-email').value = '';
    showAlert('Family access granted successfully', 'success');
    updateFamilyAccessList();
}

function removeFamilyMember(email) {
    if (!confirm(`Revoke access for ${email}?`)) return;
    
    // Remove family access
    delete healthData.familyAccess[email];
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Update view
    showAlert('Family access revoked successfully', 'success');
    updateFamilyAccessList();
}

function confirmDeleteAccount() {
    // Show confirmation modal
    const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));
    modal.show();
}

function deleteAccount() {
    const confirmEmail = document.getElementById('delete-confirm-email').value;
    const confirmPassword = document.getElementById('delete-confirm-password').value;
    
    // Validate inputs
    if (!confirmEmail || !confirmPassword) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (confirmEmail !== currentUser) {
        showAlert('Email does not match your account', 'danger');
        return;
    }
    
    const patient = loadUserData();
    
    if (confirmPassword !== patient.password) {
        showAlert('Incorrect password', 'danger');
        return;
    }
    
    // Remove patient data
    delete healthData.patients[currentUser];
    
    // Remove any family access entries for this patient
    Object.keys(healthData.familyAccess).forEach(email => {
        if (healthData.familyAccess[email].patientEmail === currentUser) {
            delete healthData.familyAccess[email];
        }
    });
    
    // Save to localStorage
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // Logout and show login page
    logoutUser();
    showAlert('Your account has been deleted', 'info');
}

// Emergency functions
function callEmergencyContact() {
    const patient = loadUserData();
    const phoneNumber = patient.personalInfo.emergencyContact.phone;
    
    if (!phoneNumber) {
        showAlert('No emergency contact phone number available', 'danger');
        return;
    }
    
    // In a real app, this would initiate a phone call
    // For this demo, we'll just show an alert
    alert(`Calling emergency contact: ${phoneNumber}`);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAlert(message, type) {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to top of container
    const container = document.querySelector('.container');
    container.insertBefore(alertElement, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
    }, 5000);
}

// Check for emergency view on page load
function checkForEmergencyView() {
    const urlParams = new URLSearchParams(window.location.search);
    const emergencyView = urlParams.get('emergencyView');
    const patientEmail = urlParams.get('patient');
    
    if (emergencyView && patientEmail && healthData.patients[patientEmail]) {
        // Show emergency view
        currentUser = patientEmail;
        userRole = 'emergency';
        document.getElementById('app-container').classList.remove('d-none');
        showEmergencyView();
    }
}

// Initialize emergency view check
checkForEmergencyView();