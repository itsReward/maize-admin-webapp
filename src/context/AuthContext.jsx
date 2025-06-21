// src/context/AuthContext.jsx - Enhanced to handle missing endpoints gracefully
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
    const [errors, setErrors] = useState([]);

    // Debug logging
    const log = (...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 [AuthContext]', ...args);
        }
    };

    const error = (...args) => {
        console.error('❌ [AuthContext]', ...args);
    };

    // Add error to the errors array
    const addError = (errorInfo) => {
        const errorId = Date.now();
        const newError = { id: errorId, timestamp: new Date(), ...errorInfo };

        setErrors(prev => {
            // Keep only last 10 errors
            const updated = [newError, ...prev].slice(0, 10);
            return updated;
        });

        // Auto-remove error after 10 seconds if it's not critical
        if (!newError.critical) {
            setTimeout(() => {
                setErrors(prev => prev.filter(err => err.id !== errorId));
            }, 10000);
        }
    };

    // Clear specific error
    const clearError = (errorId) => {
        setErrors(prev => prev.filter(err => err.id !== errorId));
    };

    // Clear all errors
    const clearAllErrors = () => {
        setErrors([]);
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
                            addError({
                                type: 'SESSION_EXPIRED',
                                message: 'Your session has expired. Please log in again.',
                                critical: true
                            });
                            error('Session validation failed, user logged out');
                        } else {
                            setSessionValidated(true);
                        }
                    } catch (validationError) {
                        error('Session validation error:', validationError);

                        // Handle different types of validation errors
                        if (validationError.status === 404) {
                            // Missing endpoint - don't logout, just note it
                            log('Session validation endpoint not found, assuming session is valid');
                            setSessionValidated(true);
                            addError({
                                type: 'MISSING_ENDPOINT',
                                message: 'Session validation endpoint not available',
                                critical: false
                            });
                        } else if (validationError.status === 401 || validationError.status === 403) {
                            // Actual auth error - logout
                            setUser(null);
                            setIsAuthenticated(false);
                            addError({
                                type: 'AUTHENTICATION_ERROR',
                                message: 'Authentication failed. Please log in again.',
                                critical: true
                            });
                        } else {
                            // Network or server error - keep user logged in
                            log('Network/server error during validation, keeping user logged in');
                            setSessionValidated(false); // Mark as not validated but keep authenticated
                            addError({
                                type: 'VALIDATION_ERROR',
                                message: 'Unable to validate session due to server issues',
                                critical: false
                            });
                        }
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
                addError({
                    type: 'INITIALIZATION_ERROR',
                    message: 'Failed to initialize authentication',
                    critical: false
                });
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

    // Handle API response errors globally - but be selective about logout
    useEffect(() => {
        const handleGlobalAuthError = (event) => {
            const { status, endpoint, error: errorDetail } = event.detail;

            log('Global auth error detected:', event.detail);

            // Only logout for specific authentication errors
            const shouldLogout = (status === 401 || status === 403) &&
                !endpoint.includes('/health') &&
                !endpoint.includes('/dashboard/stats') &&
                !endpoint.includes('/dashboard/recent-activity');

            if (shouldLogout) {
                error('Critical auth error, logging out:', event.detail);
                logout();
                addError({
                    type: 'AUTHENTICATION_ERROR',
                    message: errorDetail.message || 'Authentication failed',
                    critical: true
                });
            } else {
                // Non-critical error, just log it
                log('Non-critical API error, not logging out:', event.detail);
                addError({
                    type: errorDetail.type || 'API_ERROR',
                    message: errorDetail.message || 'API request failed',
                    endpoint,
                    status,
                    critical: false
                });
            }
        };

        window.addEventListener('auth-error', handleGlobalAuthError);
        return () => window.removeEventListener('auth-error', handleGlobalAuthError);
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            clearAllErrors(); // Clear any previous errors
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

            addError({
                type: 'LOGIN_ERROR',
                message: error.message || 'Login failed',
                critical: true
            });

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
        clearAllErrors();

        authService.logout(redirect);
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            clearAllErrors();
            log('Attempting registration:', userData.username);
            return await authService.register(userData);
        } catch (error) {
            error('Registration failed:', error);
            addError({
                type: 'REGISTRATION_ERROR',
                message: error.message || 'Registration failed',
                critical: false
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            log('Attempting password change');
            const result = await authService.changePassword(passwordData);
            addError({
                type: 'SUCCESS',
                message: 'Password changed successfully',
                critical: false
            });
            return result;
        } catch (error) {
            error('Password change failed:', error);
            addError({
                type: 'PASSWORD_CHANGE_ERROR',
                message: error.message || 'Password change failed',
                critical: false
            });
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
                // Don't automatically logout, just mark as not validated
                setSessionValidated(false);
                addError({
                    type: 'SESSION_VALIDATION_FAILED',
                    message: 'Session validation failed',
                    critical: false
                });
                return false;
            }

            setSessionValidated(true);
            clearAllErrors();
            return true;
        } catch (error) {
            error('Session refresh failed:', error);

            if (error.status === 404) {
                // Missing endpoint, assume session is valid
                setSessionValidated(true);
                return true;
            }

            addError({
                type: 'SESSION_REFRESH_ERROR',
                message: 'Unable to refresh session',
                critical: false
            });
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
        errors,
        login,
        logout,
        register,
        changePassword,
        refreshSession,
        clearError,
        clearAllErrors,
        addError,
        // Debug helpers
        getDebugInfo: () => ({
            user,
            isAuthenticated,
            loading,
            sessionValidated,
            errors,
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