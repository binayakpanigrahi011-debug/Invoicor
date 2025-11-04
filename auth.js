// Authentication check function
function checkAuth() {
    // Check both localStorage and sessionStorage for auth state
    const localAuth = localStorage.getItem('authState');
    const sessionAuth = sessionStorage.getItem('authState');
    
    // Get auth data from either storage
    const authData = localAuth ? JSON.parse(localAuth) : sessionAuth ? JSON.parse(sessionAuth) : null;

    // If no auth data exists, redirect to login
    if (!authData || !authData.isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    // Optional: Check if the session has expired (24 hours)
    const currentTime = new Date().getTime();
    const authTime = authData.timestamp;
    const hoursSinceAuth = (currentTime - authTime) / (1000 * 60 * 60);

    if (hoursSinceAuth > 24) {
        // Clear auth data if expired
        localStorage.removeItem('authState');
        sessionStorage.removeItem('authState');
        window.location.href = 'login.html';
        return;
    }

    return authData;
}

// Function to handle logout
function logout() {
    // Clear authentication data
    localStorage.removeItem('authState');
    sessionStorage.removeItem('authState');
    // Redirect to login page
    window.location.href = 'login.html';
}

// Update UI with user information
function updateUserInterface(authData) {
    // Add user's name to the header if the element exists
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement && authData.name) {
        userNameElement.textContent = authData.name;
    }
}

// Run authentication check when the script loads
const authData = checkAuth();
if (authData) {
    updateUserInterface(authData);
}