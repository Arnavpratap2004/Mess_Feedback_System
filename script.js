const body = document.body;
const navLinks = document.querySelector('.nav-links');
const burger = document.querySelector('.burger');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const successModal = document.getElementById('success-modal');
const feedbackDetailModal = document.getElementById('feedback-detail-modal');
const homePage = document.querySelector('main');
const footer = document.querySelector('footer');
const feedbackFormPage = document.getElementById('feedback-form-page');
const adminDashboardPage = document.getElementById('admin-dashboard-page');

// Auth tabs
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

// Forms
const studentLoginForm = document.getElementById('student-login-form');
const adminLoginForm = document.getElementById('admin-login-form');
const studentSignupForm = document.getElementById('student-signup-form');
const adminSignupForm = document.getElementById('admin-signup-form');
const messFeedbackForm = document.getElementById('mess-feedback-form');

// Buttons and links
const loginLink = document.getElementById('login-link');
const signupLink = document.getElementById('signup-link');
const studentCta = document.getElementById('student-cta');
const adminCta = document.getElementById('admin-cta');
const footerLogin = document.getElementById('footer-login');
const footerSignup = document.getElementById('footer-signup');
const studentSignupLink = document.getElementById('student-signup-link');
const adminSignupLink = document.getElementById('admin-signup-link');
const studentLoginLink = document.getElementById('student-login-link');
const adminLoginLink = document.getElementById('admin-login-link');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const closeButtons = document.querySelectorAll('.close-button');
const successOkBtn = document.getElementById('success-ok');
const detailCloseBtn = document.getElementById('detail-close');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const exportExcelBtn = document.getElementById('export-excel');
const exportPdfBtn = document.getElementById('export-pdf');

// API base URL - Make sure this matches your server
const API_URL = 'http://localhost:8080';
// Backup URL in case the primary doesn't work
const BACKUP_API_URL = 'http://127.0.0.1:8080';

// Authentication state
let currentUser = null;
let userType = null;

// API connection state
let apiConnected = false;
let activeApiUrl = API_URL;

// Check if user is already logged in
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedUser && savedUserType) {
        try {
            currentUser = JSON.parse(savedUser);
            userType = savedUserType;
            
            if (userType === 'student') {
                navigateToStudentDashboard();
            } else if (userType === 'admin') {
                navigateToAdminDashboard();
            }
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userType');
        }
    }
}

// Navigation toggle for mobile
if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });
}

// Tab switching functionality
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        
        // Update tab states
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update form visibility
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === target) {
                form.classList.add('active');
            }
        });
    });
});

// Modal handling
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        body.style.overflow = 'auto'; // Restore scrolling
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => closeModal(modal));
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Close button functionality
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
    });
});

// Success modal
function showSuccessMessage(title, message, callback) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    openModal(successModal);
    
    successOkBtn.onclick = () => {
        closeModal(successModal);
        if (callback) callback();
    };
}

// Error handling
function showError(message) {
    // Create a custom error message div instead of using alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span class="error-close">&times;</span>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Add event listener to close button
    const closeBtn = errorDiv.querySelector('.error-close');
    closeBtn.addEventListener('click', () => {
        errorDiv.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Log to console as well
    console.error('Error:', message);
}

// Open login/signup modals
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(signupModal);
});

footerLogin.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

footerSignup.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(signupModal);
});

// CTA buttons
studentCta.addEventListener('click', () => {
    openModal(loginModal);
    // Set active tab to student login
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'student-login') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'student-login') {
            form.classList.add('active');
        }
    });
});

adminCta.addEventListener('click', () => {
    openModal(loginModal);
    // Set active tab to admin login
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'admin-login') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'admin-login') {
            form.classList.add('active');
        }
    });
});

// Switch between login and signup
studentSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
    
    // Set active tab to student signup
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'student-signup') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'student-signup') {
            form.classList.add('active');
        }
    });
});

adminSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
    
    // Set active tab to admin signup
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'admin-signup') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'admin-signup') {
            form.classList.add('active');
        }
    });
});

studentLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
    
    // Set active tab to student login
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'student-login') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'student-login') {
            form.classList.add('active');
        }
    });
});

adminLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
    
    // Set active tab to admin login
    authTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.target === 'admin-login') {
            tab.classList.add('active');
        }
    });
    
    authForms.forEach(form => {
        form.classList.remove('active');
        if (form.id === 'admin-login') {
            form.classList.add('active');
        }
    });
});

// Authentication Functions using the API
async function loginStudent(regNo, password) {
    try {
        const response = await fetch(`${activeApiUrl}/auth/student/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ reg_no: regNo, password }),
            credentials: 'include',
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Student login error:', error);
        if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            return { 
                success: false, 
                message: 'Network error. Please check if the server is running and accessible.' 
            };
        }
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}

async function loginAdmin(employeeId, password) {
    try {
        console.log(`Attempting admin login for employee ID: ${employeeId}`);
        
        const response = await fetch(`${activeApiUrl}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ employee_id: employeeId, password }),
            credentials: 'include',
            mode: 'cors'
        });
        
        const data = await response.json();
        console.log('Admin login response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        console.log('Admin login successful:', data.user);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Admin login error:', error);
        if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            return { 
                success: false, 
                message: 'Network error. Please check if the server is running and accessible.' 
            };
        }
        return { success: false, message: error.message || 'Login failed. Please try again.' };
    }
}

async function registerStudent(name, regNo, password) {
    try {
        const response = await fetch(`${activeApiUrl}/auth/student/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                student_name: name, 
                reg_no: regNo, 
                password 
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        return { success: true, student: data.student };
    } catch (error) {
        console.error('Student registration error:', error);
        if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            return { 
                success: false, 
                message: 'Network error. Please check if the server is running and accessible.' 
            };
        }
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
}

async function registerAdmin(name, employeeId, password) {
    try {
        const response = await fetch(`${activeApiUrl}/auth/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                admin_name: name, 
                employee_id: employeeId, 
                password 
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        return { success: true, admin: data.admin };
    } catch (error) {
        console.error('Admin registration error:', error);
        if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
            return { 
                success: false, 
                message: 'Network error. Please check if the server is running and accessible.' 
            };
        }
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
    }
}

async function logout() {
    try {
        const response = await fetch(`${activeApiUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Logout failed');
        }
        
        // Clear local storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        
        // Navigate to home
        navigateToHome();
    } catch (error) {
        console.error('Logout error:', error);
        // Still navigate to home even if API call fails
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        navigateToHome();
    }
}

// Form Submissions
studentLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const regNo = document.getElementById('student-reg-no').value;
    const password = document.getElementById('student-password').value;
    
    const result = await loginStudent(regNo, password);
    
    if (result.success) {
        currentUser = result.user;
        userType = 'student';
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userType', userType);
        
        closeAllModals();
        navigateToStudentDashboard();
    } else {
        showError(result.message || 'Invalid registration number or password');
    }
});

adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = document.getElementById('admin-id').value;
    const password = document.getElementById('admin-password').value;
    
    const result = await loginAdmin(employeeId, password);
    
    if (result.success) {
        currentUser = result.user;
        userType = 'admin';
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('userType', userType);
        
        closeAllModals();
        navigateToAdminDashboard();
    } else {
        showError(result.message || 'Invalid employee ID or password');
    }
});

studentSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('student-name').value;
    const regNo = document.getElementById('student-reg-no-signup').value;
    const password = document.getElementById('student-password-signup').value;
    const confirmPassword = document.getElementById('student-confirm-password').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const result = await registerStudent(name, regNo, password);
    
    if (result.success) {
        showSuccessMessage('Registration Successful', 'Your student account has been created successfully. You can now log in.', () => {
            closeAllModals();
            openModal(loginModal);
            // Set active tab to student login
            authTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.target === 'student-login') {
                    tab.classList.add('active');
                }
            });
            
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === 'student-login') {
                    form.classList.add('active');
                }
            });
        });
    } else {
        showError(result.message || 'Registration failed');
    }
});

adminSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('admin-name').value;
    const employeeId = document.getElementById('admin-id-signup').value;
    const password = document.getElementById('admin-password-signup').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const result = await registerAdmin(name, employeeId, password);
    
    if (result.success) {
        showSuccessMessage('Registration Successful', 'Your admin account has been created successfully. You can now log in.', () => {
            closeAllModals();
            openModal(loginModal);
            // Set active tab to admin login
            authTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.target === 'admin-login') {
                    tab.classList.add('active');
                }
            });
            
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === 'admin-login') {
                    form.classList.add('active');
                }
            });
        });
    } else {
        showError(result.message || 'Registration failed');
    }
});

// Navigation Functions
function navigateToStudentDashboard() {
    homePage.classList.add('hidden');
    footer.classList.add('hidden');
    adminDashboardPage.classList.add('hidden');
    feedbackFormPage.classList.remove('hidden');
    
    // Prefill student information
    document.getElementById('feedback-reg-no').value = currentUser.reg_no;
    document.getElementById('feedback-name').value = currentUser.name;
}

async function navigateToAdminDashboard() {
    console.log('Navigating to admin dashboard with user:', currentUser);
    
    // Verify we have admin permissions before showing dashboard
    if (!currentUser || localStorage.getItem('userType') !== 'admin') {
        showError('You must be logged in as an administrator to access the dashboard');
        navigateToHome();
        return;
    }
    
    // Update UI visibility
    homePage.classList.add('hidden');
    footer.classList.add('hidden');
    feedbackFormPage.classList.add('hidden');
    adminDashboardPage.classList.remove('hidden');
    
    // Set admin-specific headers for all future requests
    const headers = {
        'X-User-ID': currentUser.id,
        'X-User-Type': 'admin'
    };
    
    try {
        // Verify admin authentication still valid
        const authResponse = await fetch(`${activeApiUrl}/auth/check-auth`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...headers
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        const authData = await authResponse.json();
        
        if (!authData.isAuthenticated) {
            throw new Error('Admin session invalid or expired');
        }
        
        // Load feedback data from API
        console.log('Loading admin dashboard data...');
        await fetchAndLoadFeedbackData();
    } catch (error) {
        console.error('Admin dashboard error:', error);
        showError(`Error accessing admin dashboard: ${error.message}`);
        setTimeout(() => {
            navigateToHome();
        }, 2000);
    }
}

function navigateToHome() {
    feedbackFormPage.classList.add('hidden');
    adminDashboardPage.classList.add('hidden');
    homePage.classList.remove('hidden');
    footer.classList.remove('hidden');
    
    currentUser = null;
    userType = null;
}

// Logout functionality
logoutBtn.addEventListener('click', logout);
adminLogoutBtn.addEventListener('click', logout);

// Feedback Functions
async function submitFeedback(feedbackData) {
    try {
        // Get the stored auth data for headers
        const savedUser = localStorage.getItem('currentUser');
        const authData = savedUser ? JSON.parse(savedUser) : null;
        
        if (!authData) {
            showError('Authentication error: User data not found. Please try logging in again.');
            return { success: false, message: 'Authentication error' };
        }
        
        // Add timestamp to help prevent duplicate submissions
        const submitData = {
            ...feedbackData,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(`${activeApiUrl}/feedback/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Include auth information in headers to ensure it gets through
                'X-User-ID': authData.id || '',
                'X-User-Type': localStorage.getItem('userType') || ''
            },
            body: JSON.stringify(submitData),
            credentials: 'include',
            mode: 'cors'
        });
        
        // Handle 401 errors with special retry logic
        if (response.status === 401) {
            console.log('Authentication failed during submission, attempting to restore session...');
            
            // Try to restore the session
            const authStatus = await validateAuth();
            
            if (authStatus.valid) {
                // Session restored, try submitting again
                console.log('Session restored, retrying submission...');
                
                const retryResponse = await fetch(`${activeApiUrl}/feedback/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-User-ID': authData.id || '',
                        'X-User-Type': localStorage.getItem('userType') || ''
                    },
                    body: JSON.stringify(submitData),
                    credentials: 'include',
                    mode: 'cors'
                });
                
                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    console.log('Retry successful!');
                    return { success: true, feedback: retryData.feedback };
                } else {
                    const errorData = await retryResponse.json();
                    throw new Error(errorData.message || 'Retry submission failed');
                }
            } else {
                throw new Error('Authentication failed. Your session could not be restored. Please log in again.');
            }
        }
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to submit feedback');
        }
        
        const data = await response.json();
        return { success: true, feedback: data.feedback };
    } catch (error) {
        console.error('Feedback submission error:', error);
        return { success: false, message: error.message };
    }
}

async function fetchFeedbackData(filters = {}) {
    try {
        // Verify we're logged in as admin
        if (userType !== 'admin' || !currentUser) {
            return { 
                success: false, 
                message: 'Admin authentication required'
            };
        }
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.student_reg_no) queryParams.append('student_reg_no', filters.student_reg_no);
        if (filters.mess_name) queryParams.append('mess_name', filters.mess_name);
        if (filters.block_name) queryParams.append('block_name', filters.block_name);
        if (filters.start_date) queryParams.append('start_date', filters.start_date);
        if (filters.end_date) queryParams.append('end_date', filters.end_date);
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        // Use filter endpoint if filters are applied, otherwise use the "all" endpoint
        const endpoint = Object.keys(filters).length > 0 ? 
            `${activeApiUrl}/feedback/filter${queryString}` : 
            `${activeApiUrl}/feedback/admin/all`;
        
        console.log('Fetching admin feedback from:', endpoint);
        
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-ID': currentUser.id,
                'X-User-Type': 'admin'
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        // Check for auth errors
        if (response.status === 401 || response.status === 403) {
            console.error('Admin authorization failed when fetching feedback');
            const errorData = await response.json();
            throw new Error(errorData.message || 'Admin authorization failed');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch feedback data');
        }
        
        console.log('Admin feedback data fetched successfully:', data);
        
        return {
            success: true,
            feedbackList: data.feedbackList || [],
            statistics: data.statistics || null
        };
    } catch (error) {
        console.error('Fetch admin feedback error:', error);
        return { success: false, message: error.message };
    }
}

async function fetchFeedbackById(id) {
    try {
        // Verify we have authentication data
        const savedUser = localStorage.getItem('currentUser');
        const authData = savedUser ? JSON.parse(savedUser) : null;
        
        if (!authData) {
            return { 
                success: false, 
                message: 'Authentication required to view feedback details'
            };
        }
        
        console.log(`Fetching feedback details for ID: ${id}`);
        
        const response = await fetch(`${activeApiUrl}/feedback/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-ID': authData.id,
                'X-User-Type': localStorage.getItem('userType') || ''
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        if (response.status === 401 || response.status === 403) {
            console.error('Authorization failed when fetching feedback details');
            const errorData = await response.json();
            throw new Error(errorData.message || 'Authorization failed');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch feedback details');
        }
        
        console.log('Feedback details fetched successfully:', data);
        return { success: true, feedback: data.feedback };
    } catch (error) {
        console.error('Fetch feedback detail error:', error);
        return { success: false, message: error.message };
    }
}

// Validate authentication before sensitive operations
async function validateAuth() {
    try {
        // Check if we have local storage data
        const savedUser = localStorage.getItem('currentUser');
        const savedUserType = localStorage.getItem('userType');
        
        if (!savedUser || !savedUserType) {
            return { valid: false, message: 'No authentication data found' };
        }
        
        const authData = JSON.parse(savedUser);
        
        // Verify auth status with server, sending headers for potential restoration
        const response = await fetch(`${activeApiUrl}/auth/check-auth`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-ID': authData.id || '',
                'X-User-Type': savedUserType
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        if (!response.ok) {
            return { valid: false, message: 'Failed to verify authentication status' };
        }
        
        const data = await response.json();
        
        if (data.restored) {
            console.log('Session was restored successfully');
        }
        
        if (data.isAuthenticated) {
            return { valid: true, user: data.user };
        }
        
        return { valid: false, message: 'Authentication failed', needsLogin: true };
    } catch (error) {
        console.error('Auth validation error:', error);
        return { valid: false, message: error.message };
    }
}

// Feedback Form Submission
messFeedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Attempt to validate and restore authentication if needed
    let authStatus = await validateAuth();
    
    // If initial validation failed, try one more time after a short delay
    if (!authStatus.valid && authStatus.needsLogin) {
        showError('Session expired. Attempting to restore your session...');
        
        // Wait a moment for session to be restored
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try validation again
        authStatus = await validateAuth();
    }
    
    // If still not valid after retry, redirect to login
    if (!authStatus.valid) {
        showError(`Authentication error: ${authStatus.message}. Please log in again.`);
        
        // Clear stored credentials to force fresh login
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
        
        // Redirect to home/login after a brief delay
        setTimeout(() => {
            navigateToHome();
            openModal(loginModal);
        }, 2000);
        
        return;
    }
    
    // Collect form data
    const regNo = document.getElementById('feedback-reg-no').value;
    const studentName = document.getElementById('feedback-name').value;
    const block = document.getElementById('feedback-block').value;
    const roomNo = document.getElementById('feedback-room').value;
    const messName = document.getElementById('feedback-mess-name').value;
    const messType = document.querySelector('input[name="mess-type"]:checked')?.value;
    
    // Validate mess type selection
    if (!messType) {
        showError('Please select a mess type');
        return;
    }
    
    const category = document.querySelector('input[name="category"]:checked')?.value;
    
    // Validate category selection
    if (!category) {
        showError('Please select a category');
        return;
    }
    
    const suggestion = document.getElementById('feedback-suggestion').value;
    const comments = document.getElementById('feedback-comments').value;
    
    // Prepare feedback data
    const feedbackData = {
        student_reg_no: regNo,
        student_name: studentName,
        block_name: block,
        room_number: roomNo,
        mess_name: messName,
        mess_type: messType,
        category,
        feedback: suggestion,
        comments,
        // Include auth information for extra verification
        user_id: authStatus.user?.id
    };
    
    // Submit the feedback
    const result = await submitFeedback(feedbackData);
    
    if (result.success) {
        showSuccessMessage('Feedback Submitted', 'Your feedback has been submitted successfully. Thank you for your input!', () => {
            messFeedbackForm.reset();
            // Prefill student information again
            document.getElementById('feedback-reg-no').value = currentUser.reg_no;
            document.getElementById('feedback-name').value = currentUser.name;
        });
    } else {
        showError(result.message || 'Failed to submit feedback');
    }
});

// Admin Dashboard Functions
async function fetchAndLoadFeedbackData(filters = {}) {
    const result = await fetchFeedbackData(filters);
    
    if (result.success) {
        loadFeedbackData(result.feedbackList);
        
        // Update statistics if available
        if (result.statistics) {
            updateSummaryStats(result.statistics);
        }
    } else {
        showError(result.message || 'Failed to load feedback data');
    }
}

function loadFeedbackData(data) {
    const tableBody = document.getElementById('feedback-data');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No feedback data found</td></tr>';
        return;
    }
    
    data.forEach(feedback => {
        const tr = document.createElement('tr');
        
        // Format date if it exists
        const formattedDate = feedback.submitted_at ? 
            formatDate(new Date(feedback.submitted_at)) : 'N/A';
        
        tr.innerHTML = `
            <td>${feedback.id}</td>
            <td>${feedback.student_name}</td>
            <td>${feedback.student_reg_no}</td>
            <td>${feedback.mess_name}</td>
            <td>${feedback.block_name}</td>
            <td>${feedback.category}</td>
            <td>${formattedDate}</td>
            <td>
                <button class="btn btn-secondary view-details" data-id="${feedback.id}">View</button>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', async () => {
            const feedbackId = button.dataset.id;
            await showFeedbackDetails(feedbackId);
        });
    });
}

async function showFeedbackDetails(feedbackId) {
    try {
        // First verify we're authenticated
        if (!currentUser) {
            showError('You must be logged in to view feedback details');
            return;
        }
        
        // Show loading state
        const detailContent = document.getElementById('feedback-detail-content');
        detailContent.innerHTML = '<div class="loading">Loading feedback details...</div>';
        openModal(feedbackDetailModal);
        
        const result = await fetchFeedbackById(feedbackId);
        
        if (!result.success) {
            detailContent.innerHTML = `
                <div class="error-message">
                    <h4>Error Loading Details</h4>
                    <p>${result.message || 'Failed to load feedback details'}</p>
                    <p>Please try again or check your authentication status.</p>
                </div>
            `;
            return;
        }
        
        const feedback = result.feedback;
        
        // Format date if it exists
        const submittedDate = feedback.submitted_at ? 
            new Date(feedback.submitted_at).toLocaleString() : 'N/A';
        
        detailContent.innerHTML = `
            <div class="detail-item">
                <h4>Student Information</h4>
                <p>Name: ${feedback.student_name}</p>
                <p>Registration Number: ${feedback.student_reg_no}</p>
                <p>Block: ${feedback.block_name}</p>
                <p>Room Number: ${feedback.room_number}</p>
            </div>
            <div class="detail-item">
                <h4>Mess Information</h4>
                <p>Mess Name: ${feedback.mess_name}</p>
                <p>Mess Type: ${feedback.mess_type}</p>
            </div>
            <div class="detail-item">
                <h4>Feedback Details</h4>
                <p>Category: ${feedback.category}</p>
                <p>Feedback: ${feedback.feedback}</p>
                <p>Comments: ${feedback.comments || 'N/A'}</p>
                ${feedback.proof_path ? `<p>Proof File: ${feedback.proof_path}</p>` : ''}
                <p>Submitted on: ${submittedDate}</p>
            </div>
        `;
    } catch (error) {
        console.error('Show feedback details error:', error);
        showError(`Error displaying feedback details: ${error.message}`);
        closeModal(feedbackDetailModal);
    }
}

function updateSummaryStats(statistics) {
    document.getElementById('total-feedback').textContent = statistics.totalFeedbacks || 0;
    document.getElementById('weekly-feedback').textContent = statistics.weeklyFeedbacks || 0;
    document.getElementById('monthly-feedback').textContent = statistics.monthlyFeedbacks || 0;
}

// Apply filters
applyFiltersBtn.addEventListener('click', async () => {
    const studentFilter = document.getElementById('filter-student').value;
    const messFilter = document.getElementById('filter-mess').value;
    const blockFilter = document.getElementById('filter-block').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    
    // Build filter object
    const filters = {};
    if (studentFilter) filters.student_reg_no = studentFilter;
    if (messFilter) filters.mess_name = messFilter;
    if (blockFilter) filters.block_name = blockFilter;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    
    // Fetch and load data with filters
    await fetchAndLoadFeedbackData(filters);
});

// Reset filters
resetFiltersBtn.addEventListener('click', async () => {
    document.getElementById('filter-student').value = '';
    document.getElementById('filter-mess').value = '';
    document.getElementById('filter-block').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    
    // Fetch all feedback without filters
    await fetchAndLoadFeedbackData();
});

// Export functionality
exportExcelBtn.addEventListener('click', async () => {
    // Verify we're logged in as admin
    if (userType !== 'admin' || !currentUser) {
        showError('Admin authentication required for export');
        return;
    }
    
    // Get current filter values
    const studentFilter = document.getElementById('filter-student').value;
    const messFilter = document.getElementById('filter-mess').value;
    const blockFilter = document.getElementById('filter-block').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    
    // Build query string
    const params = new URLSearchParams();
    if (studentFilter) params.append('student_reg_no', studentFilter);
    if (messFilter) params.append('mess_name', messFilter);
    if (blockFilter) params.append('block_name', blockFilter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    try {
        // Create export URL
        const exportUrl = `${activeApiUrl}/feedback/export/excel?${params.toString()}`;
        
        // First check auth status
        const authResponse = await fetch(`${activeApiUrl}/auth/check-auth`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'X-User-ID': currentUser.id,
                'X-User-Type': 'admin'
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        const authData = await authResponse.json();
        if (!authData.isAuthenticated) {
            throw new Error('Authentication required for export');
        }
        
        // Use fetch with proper headers to get the file
        const response = await fetch(exportUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'X-User-ID': currentUser.id,
                'X-User-Type': 'admin'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Export failed');
        }
        
        // Convert response to blob and create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        
    } catch (error) {
        console.error('Excel export error:', error);
        showError(`Excel export failed: ${error.message}`);
    }
});

exportPdfBtn.addEventListener('click', async () => {
    // Verify we're logged in as admin
    if (userType !== 'admin' || !currentUser) {
        showError('Admin authentication required for export');
        return;
    }
    
    // Get current filter values
    const studentFilter = document.getElementById('filter-student').value;
    const messFilter = document.getElementById('filter-mess').value;
    const blockFilter = document.getElementById('filter-block').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    
    // Build query string
    const params = new URLSearchParams();
    if (studentFilter) params.append('student_reg_no', studentFilter);
    if (messFilter) params.append('mess_name', messFilter);
    if (blockFilter) params.append('block_name', blockFilter);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    try {
        // Create export URL
        const exportUrl = `${activeApiUrl}/feedback/export/pdf?${params.toString()}`;
        
        // First check auth status
        const authResponse = await fetch(`${activeApiUrl}/auth/check-auth`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-User-ID': currentUser.id,
                'X-User-Type': 'admin'
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        const authData = await authResponse.json();
        if (!authData.isAuthenticated) {
            throw new Error('Authentication required for export');
        }
        
        // Use fetch with proper headers to get the file
        const response = await fetch(exportUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'X-User-ID': currentUser.id,
                'X-User-Type': 'admin'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Export failed');
        }
        
        // Convert response to blob and create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        
    } catch (error) {
        console.error('PDF export error:', error);
        showError(`PDF export failed: ${error.message}`);
    }
});

// Utility Functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Check API reachability with fallback
async function checkApiReachability() {
    try {
        // Try the primary URL first
        try {
            const response = await fetch(`${API_URL}/test`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('Primary API URL is reachable');
                activeApiUrl = API_URL;
                apiConnected = true;
                return true;
            }
        } catch (primaryError) {
            console.error('Primary API URL not reachable:', primaryError);
        }
        
        // Try the backup URL if primary failed
        try {
            const backupResponse = await fetch(`${BACKUP_API_URL}/test`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            });
            
            if (backupResponse.ok) {
                console.log('Backup API URL is reachable');
                activeApiUrl = BACKUP_API_URL;
                apiConnected = true;
                return true;
            }
        } catch (backupError) {
            console.error('Backup API URL not reachable:', backupError);
        }
        
        // None of the URLs worked
        console.error('All API URLs failed');
        apiConnected = false;
        return false;
    } catch (error) {
        console.error('API connection error:', error);
        apiConnected = false;
        return false;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Try to connect to the API
    const apiReachable = await checkApiReachability();
    
    if (!apiReachable) {
        // Show API connection error
        const errorContainer = document.createElement('div');
        errorContainer.className = 'api-error';
        errorContainer.innerHTML = `
            <div class="error-message">
                <h3>Unable to connect to the API server</h3>
                <p>Please make sure the server is running.</p>
                <button id="retry-connection">Retry Connection</button>
            </div>
        `;
        document.body.prepend(errorContainer);
        
        // Add retry button functionality
        document.getElementById('retry-connection').addEventListener('click', async function() {
            const retryResult = await checkApiReachability();
            if (retryResult) {
                errorContainer.remove();
                checkAuth(); // Check auth state after connection is restored
            }
        });
    } else {
        // Check authentication status if the API is reachable
        checkAuth();
    }
});

// Additional event listeners for detail modal
detailCloseBtn.addEventListener('click', () => {
    closeModal(feedbackDetailModal);
});