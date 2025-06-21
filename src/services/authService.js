// src/services/authService.js - Enhanced with debugging
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api';

class AuthService {
    constructor() {
        this.TOKEN_KEY = 'maize_auth_token';
        this.USER_KEY = 'maize_user_data';
        this.enableLogging = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';

        // Track authentication state
        this.authListeners = [];
        this.isValidatingSession = false;
    }

    log(...args) {
        if (this.enableLogging) {
            console.log('🔐 [AuthService]', ...args);
        }
    }

    error(...args) {
        console.error('❌ [AuthService]', ...args);
    }

    // Get stored token
    getToken() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        this.log('Getting token:', token ? 'Present' : 'Missing');
        return token;
    }

    // Get stored user data
    getUserData() {
        const userData = localStorage.getItem(this.USER_KEY);
        const parsed = userData ? JSON.parse(userData) : null;
        this.log('Getting user data:', parsed);
        return parsed;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const userData = this.getUserData();

        this.log('Checking authentication - Token:', !!token, 'UserData:', !!userData);

        if (!token || !userData) {
            this.log('Authentication failed: Missing token or user data');
            return false;
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - currentTime;

            this.log('Token expiry check:', {
                expiresAt: new Date(payload.exp * 1000).toLocaleString(),
                currentTime: new Date(currentTime * 1000).toLocaleString(),
                timeUntilExpiry: `${Math.round(timeUntilExpiry / 60)} minutes`,
                isExpired: payload.exp < currentTime
            });

            if (payload.exp < currentTime) {
                this.error('Token is expired, logging out');
                this.logout(false); // Don't redirect immediately
                return false;
            }

            return true;
        } catch (error) {
            this.error('Error checking token validity:', error);
            this.logout(false);
            return false;
        }
    }

    // Login user
    async login(credentials) {
        try {
            this.log('Attempting login for user:', credentials.username);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            this.log('Login response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                this.error('Login failed:', errorData);
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }

            const data = await response.json();
            this.log('Login successful, received data:', {
                hasToken: !!data.token,
                tokenLength: data.token?.length,
                userId: data.userId,
                username: data.username,
                expiresIn: data.expiresIn
            });

            // Store token and user data
            localStorage.setItem(this.TOKEN_KEY, data.token);
            const userData = {
                userId: data.userId,
                username: data.username,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.USER_KEY, JSON.stringify(userData));

            this.log('Stored authentication data successfully');

            // Notify listeners
            this.notifyAuthListeners(true, userData);

            return data;
        } catch (error) {
            this.error('Login error:', error);
            throw error;
        }
    }

    // Register user
    async register(userData) {
        try {
            this.log('Attempting registration for user:', userData.username);

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                this.error('Registration failed:', errorData);
                throw new Error(errorData.message || `Registration failed: ${response.status}`);
            }

            const data = await response.json();
            this.log('Registration successful');
            return data;
        } catch (error) {
            this.error('Registration error:', error);
            throw error;
        }
    }

    // Logout user
    logout(redirect = true) {
        this.log('Logging out user, redirect:', redirect);

        const hadToken = !!this.getToken();

        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);

        // Notify listeners
        this.notifyAuthListeners(false, null);

        if (redirect && hadToken) {
            this.log('Redirecting to login page');
            // Use a small delay to prevent infinite redirect loops
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        const header = token ? { Authorization: `Bearer ${token}` } : {};
        this.log('Generated auth header:', Object.keys(header));
        return header;
    }

    // Change password
    async changePassword(passwordData) {
        try {
            this.log('Attempting password change');

            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                },
                body: JSON.stringify(passwordData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                this.error('Password change failed:', errorData);
                throw new Error(errorData.message || `Password change failed: ${response.status}`);
            }

            const data = await response.json();
            this.log('Password change successful');
            return data;
        } catch (error) {
            this.error('Password change error:', error);
            throw error;
        }
    }

    // Validate current session
    async validateSession() {
        if (this.isValidatingSession) {
            this.log('Session validation already in progress');
            return true;
        }

        if (!this.isAuthenticated()) {
            this.log('Session validation failed: Not authenticated');
            return false;
        }

        try {
            this.isValidatingSession = true;
            this.log('Validating session with server');

            // Try to make an authenticated request to validate the token
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                },
            });

            this.log('Session validation response:', response.status);

            if (response.status === 401 || response.status === 403) {
                this.error('Session validation failed: Unauthorized');
                this.logout();
                return false;
            }

            if (!response.ok) {
                this.error('Session validation failed: Server error', response.status);
                return false;
            }

            this.log('Session validation successful');
            return true;
        } catch (error) {
            this.error('Session validation error:', error);
            return false;
        } finally {
            this.isValidatingSession = false;
        }
    }

    // Add authentication state listener
    addAuthListener(listener) {
        this.authListeners.push(listener);
        return () => {
            this.authListeners = this.authListeners.filter(l => l !== listener);
        };
    }

    // Notify all listeners of authentication state changes
    notifyAuthListeners(isAuthenticated, userData) {
        this.log('Notifying auth listeners:', isAuthenticated, userData);
        this.authListeners.forEach(listener => {
            try {
                listener(isAuthenticated, userData);
            } catch (error) {
                this.error('Error in auth listener:', error);
            }
        });
    }

    // Get debug info
    getDebugInfo() {
        const token = this.getToken();
        const userData = this.getUserData();

        let tokenInfo = null;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;
                tokenInfo = {
                    issuedAt: new Date(payload.iat * 1000).toLocaleString(),
                    expiresAt: new Date(payload.exp * 1000).toLocaleString(),
                    timeUntilExpiry: `${Math.round((payload.exp - currentTime) / 60)} minutes`,
                    isExpired: payload.exp < currentTime,
                    subject: payload.sub,
                    audience: payload.aud
                };
            } catch (error) {
                tokenInfo = { error: 'Invalid token format' };
            }
        }

        return {
            hasToken: !!token,
            tokenLength: token?.length,
            hasUserData: !!userData,
            userData,
            tokenInfo,
            isAuthenticated: this.isAuthenticated(),
            apiBaseUrl: API_BASE_URL,
            enableLogging: this.enableLogging
        };
    }
}

// Create and export singleton instance
const authService = new AuthService();

// Make debug info available globally in development
if (process.env.NODE_ENV === 'development') {
    window.authService = authService;
    window.getAuthDebugInfo = () => authService.getDebugInfo();
}

export default authService;