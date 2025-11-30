// Authentication Guard - Redirects to login if user is not authenticated
(function() {
    // Check if we're already on the login page to avoid redirect loops
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    const isLoginPage = currentUrl.includes('login.html') || 
                       currentPath.endsWith('login.html') ||
                       (currentPath === '/' && currentUrl.includes('login'));
    
    if (isLoginPage) {
        return; // Don't redirect if already on login page
    }

    // Check if user is logged in
    const USER_KEY = "PulseUser";
    let user = null;
    
    try {
        const raw = localStorage.getItem(USER_KEY);
        user = raw ? JSON.parse(raw) : null;
    } catch (e) {
        user = null;
    }

    // If user is not logged in, redirect to login page
    if (!user || !user.loggedIn) {
        window.location.href = "login.html";
    }
})();

