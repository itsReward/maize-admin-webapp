// src/context/AuthContext.jsx - Enhanced with better session handling
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sessionValidated, setSessionValidated] = useState(false);

    // Debug logging
    const log = (...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 [AuthContext]', ...args);
        }
    };

    const error = (...args) => {
        console.error('❌ [AuthContext]', ...args);
    };

    // Initialize authentication state
    useEffect(() => {
        log('Initializing authentication state');

        const initializeAuth = async () => {
            try {
                setLoading(true);

                // Check if user is authenticated locally
                const isAuth = authService.isAuthenticated();
                const userData = authService.getUserData();

                log('Initial auth check:', { isAuth, userData });

                if (isAuth && userData) {
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Validate session with server in background
                    try {
                        const isValidSession = await authService.validateSession();
                        log('Session validation result:', isValidSession);

                        if (!isValidSession) {
                            // Session is invalid, clear auth state
                            setUser(null);
                            setIsAuthenticated(false);
                            error('Session validation failed, user logged out');
                        } else {
                            setSessionValidated(true);
                        }
                    } catch (validationError) {
                        error('Session validation error:', validationError);
                        // Keep user logged in locally if validation fails due to network issues
                        // but don't mark session as validated
                    }
                } else {
                    log('User not authenticated locally');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (initError) {
                error('Auth initialization error:', initError);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Set up auth state listener
        const removeListener = authService.addAuthListener((isAuth, userData) => {
            log('Auth state changed:', { isAuth, userData });
            setIsAuthenticated(isAuth);
            setUser(userData);
            if (!isAuth) {
                setSessionValidated(false);
            }
        });

        return removeListener;
    }, []);

    // Periodic session validation
    useEffect(() => {
        if (!isAuthenticated || !sessionValidated) {
            return;
        }

        const validatePeriodically = async () => {
            try {
                const isValid = await authService.validateSession();
                if (!isValid) {
                    log('Periodic session validation failed');
                    setUser(null);
                    setIsAuthenticated(false);
                    setSessionValidated(false);
                }
            } catch (error) {
                error('Periodic session validation error:', error);
            }
        };

        // Validate session every 5 minutes
        const interval = setInterval(validatePeriodically, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, sessionValidated]);

    // Handle API response errors globally
    useEffect(() => {
        const handleGlobalAuthError = (event) => {
            if (event.detail && (event.detail.status === 401 || event.detail.status === 403)) {
                error('Global auth error detected:', event.detail);
                logout();
            }
        };

        window.addEventListener('auth-error', handleGlobalAuthError);
        return () => window.removeEventListener('auth-error', handleGlobalAuthError);
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            log('Attempting login:', credentials.username);

            const response = await authService.login(credentials);

            const userData = {
                userId: response.userId,
                username: response.username,
                loginTime: new Date().toISOString()
            };

            setUser(userData);
            setIsAuthenticated(true);
            setSessionValidated(true);

            log('Login successful:', userData);
            return response;
        } catch (error) {
            error('Login failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            setSessionValidated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = (redirect = true) => {
        log('Logging out, redirect:', redirect);

        setUser(null);
        setIsAuthenticated(false);
        setSessionValidated(false);

        authService.logout(redirect);
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            log('Attempting registration:', userData.username);
            return await authService.register(userData);
        } catch (error) {
            error('Registration failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            log('Attempting password change');
            return await authService.changePassword(passwordData);
        } catch (error) {
            error('Password change failed:', error);
            throw error;
        }
    };

    // Force session refresh
    const refreshSession = async () => {
        if (!isAuthenticated) {
            return false;
        }

        try {
            setLoading(true);
            const isValid = await authService.validateSession();

            if (!isValid) {
                logout();
                return false;
            }

            setSessionValidated(true);
            return true;
        } catch (error) {
            error('Session refresh failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        sessionValidated,
        login,
        logout,
        register,
        changePassword,
        refreshSession,
        // Debug helpers
        getDebugInfo: () => ({
            user,
            isAuthenticated,
            loading,
            sessionValidated,
            authServiceDebug: authService.getDebugInfo()
        })
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;