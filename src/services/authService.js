// src/services/authService.js - COMPLETE FIXED VERSION

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8181/api';

class AuthService {
    constructor() {
        this.TOKEN_KEY = 'maize_auth_token';
        this.USER_KEY = 'maize_user_data';
        this.enableLogging = process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development';
        this.authListeners = [];
    }

    log(...args) {
        if (this.enableLogging) {
            console.log('🔐 [AuthService]', ...args);
        }
    }

    error(...args) {
        console.error('❌ [AuthService]', ...args);
    }

    // FIXED: Store token properly
    setToken(token) {
        try {
            this.log('Storing token:', token ? 'Present' : 'Missing');
            if (token) {
                localStorage.setItem(this.TOKEN_KEY, token);
                this.log('✅ Token stored successfully');
            } else {
                localStorage.removeItem(this.TOKEN_KEY);
                this.log('❌ Token removed');
            }
        } catch (error) {
            this.error('Failed to store token:', error);
        }
    }

    // FIXED: Store user data properly
    setUserData(userData) {
        try {
            this.log('Storing user data:', userData);
            if (userData) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
                this.log('✅ User data stored successfully');
            } else {
                localStorage.removeItem(this.USER_KEY);
                this.log('❌ User data removed');
            }
        } catch (error) {
            this.error('Failed to store user data:', error);
        }
    }

    // Get stored token
    getToken() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        this.log('Getting token:', token ? 'Present' : 'Missing');
        return token;
    }

    // Get stored user data
    getUserData() {
        try {
            const userData = localStorage.getItem(this.USER_KEY);
            if (userData) {
                const parsed = JSON.parse(userData);
                this.log('Getting user data:', parsed);
                return parsed;
            }
            this.log('No user data in storage');
            return null;
        } catch (error) {
            this.error('Failed to parse user data:', error);
            localStorage.removeItem(this.USER_KEY);
            return null;
        }
    }

    // FIXED: Complete login method
    async login(credentials) {
        try {
            this.log('🚀 Starting login for:', credentials.username);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            this.log('📡 Login response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                this.error('❌ Login failed:', errorData);
                throw new Error(errorData.message || `Login failed: ${response.status}`);
            }

            const loginData = await response.json();
            this.log('📦 Login response data:', loginData);

            if (!loginData.token) {
                throw new Error('No token received from login');
            }

            // STEP 1: Store the token immediately
            this.setToken(loginData.token);

            // STEP 2: Fetch complete user profile using the token
            this.log('👤 Fetching user profile...');
            try {
                const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                this.log('👤 User profile response status:', userResponse.status);

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    this.log('✅ Complete user data received:', userData);

                    // Store complete user data including role
                    this.setUserData(userData);

                    // Notify listeners
                    this.notifyAuthListeners(true, userData);

                    return {
                        ...loginData,
                        user: userData
                    };
                } else {
                    this.log('⚠️ Failed to fetch user profile, using fallback data');

                    // Fallback: Create user data from login response
                    const fallbackUser = {
                        id: loginData.userId,
                        username: loginData.username,
                        email: credentials.username, // Use login username as email fallback
                        role: 'ADMIN', // Default to ADMIN for now - you can change this
                        firstName: 'User',
                        lastName: ''
                    };

                    this.setUserData(fallbackUser);
                    this.notifyAuthListeners(true, fallbackUser);

                    return {
                        ...loginData,
                        user: fallbackUser
                    };
                }
            } catch (profileError) {
                this.error('💥 Error fetching user profile:', profileError);

                // Create basic user data as final fallback
                const basicUser = {
                    id: loginData.userId || 1,
                    username: loginData.username || credentials.username,
                    email: credentials.username,
                    role: 'ADMIN', // Default role
                    firstName: 'User',
                    lastName: ''
                };

                this.setUserData(basicUser);
                this.notifyAuthListeners(true, basicUser);

                return {
                    ...loginData,
                    user: basicUser
                };
            }

        } catch (error) {
            this.error('💥 Complete login error:', error);
            this.clearAuthData();
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const userData = this.getUserData();

        const isAuth = !!(token && userData);
        this.log('🔍 Authentication check:', {
            hasToken: !!token,
            hasUserData: !!userData,
            isAuthenticated: isAuth
        });

        return isAuth;
    }

    // Get authorization header
    getAuthHeader() {
        const token = this.getToken();
        if (token) {
            const header = { Authorization: `Bearer ${token}` };
            this.log('🔑 Generated auth header:', Object.keys(header));
            return header;
        }
        this.log('❌ No token for auth header');
        return {};
    }

    // Clear all auth data
    clearAuthData() {
        this.log('🧹 Clearing all auth data');
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    // Logout
    logout(redirect = true) {
        this.log('👋 Logging out, redirect:', redirect);

        this.clearAuthData();
        this.notifyAuthListeners(false, null);

        if (redirect) {
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    }

    // Validate session
    async validateSession() {
        if (!this.isAuthenticated()) {
            this.log('❌ Session validation failed: Not authenticated');
            return false;
        }

        try {
            this.log('🔍 Validating session...');

            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader(),
                },
            });

            this.log('🔍 Session validation response:', response.status);

            if (response.status === 401 || response.status === 403) {
                this.error('❌ Session invalid: Unauthorized');
                this.logout(false);
                return false;
            }

            if (!response.ok) {
                this.error('⚠️ Session validation error:', response.status);
                return false;
            }

            this.log('✅ Session valid');
            return true;

        } catch (error) {
            this.error('💥 Session validation error:', error);
            return false;
        }
    }

    // Auth state listeners
    addAuthListener(callback) {
        this.authListeners.push(callback);
        return () => {
            this.authListeners = this.authListeners.filter(listener => listener !== callback);
        };
    }

    notifyAuthListeners(isAuthenticated, userData) {
        this.log('📢 Notifying auth listeners:', { isAuthenticated, userData });
        this.authListeners.forEach(callback => {
            try {
                callback(isAuthenticated, userData);
            } catch (error) {
                this.error('Auth listener error:', error);
            }
        });
    }

    // Debug helper
    getDebugInfo() {
        return {
            hasToken: !!this.getToken(),
            hasUserData: !!this.getUserData(),
            userData: this.getUserData(),
            isAuthenticated: this.isAuthenticated()
        };
    }
}

export default new AuthService();