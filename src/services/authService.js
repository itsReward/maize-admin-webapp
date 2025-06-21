// src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api';

class AuthService {
    constructor() {
        this.TOKEN_KEY = 'maize_auth_token';
        this.USER_KEY = 'maize_user_data';
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Get stored user data
    getUserData() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const userData = this.getUserData();

        if (!token || !userData) {
            return false;
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp < currentTime) {
                this.logout(); // Remove expired token
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking token validity:', error);
            this.logout();
            return false;
        }
    }

    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }

            const data = await response.json();

            // Store token and user data
            localStorage.setItem(this.TOKEN_KEY, data.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify({
                userId: data.userId,
                username: data.username,
                loginTime: new Date().toISOString()
            }));

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);

        // Clear any application state if needed
        window.location.href = '/login';
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    // Change password
    async changePassword(passwordData) {
        try {
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
                throw new Error(errorData.message || `Password change failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    }

    // Validate current session
    async validateSession() {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            // Try to make an authenticated request to validate the token
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: this.getAuthHeader(),
            });

            if (response.status === 401 || response.status === 403) {
                this.logout();
                return false;
            }

            return response.ok;
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;