// src/context/AuthContext.jsx - FIXED VERSION

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
        setErrors(prev => [newError, ...prev].slice(0, 10));

        if (!newError.critical) {
            setTimeout(() => {
                setErrors(prev => prev.filter(err => err.id !== errorId));
            }, 10000);
        }
    };

    const clearError = (errorId) => {
        setErrors(prev => prev.filter(err => err.id !== errorId));
    };

    const clearAllErrors = () => {
        setErrors([]);
    };

    // Initialize authentication state
    useEffect(() => {
        log('🚀 Initializing authentication state');

        const initializeAuth = async () => {
            try {
                setLoading(true);

                // Check if user is authenticated locally
                const isAuth = authService.isAuthenticated();
                const userData = authService.getUserData();

                log('📋 Initial auth check:', { isAuth, userData });

                if (isAuth && userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    log('✅ User authenticated locally');

                    // Validate session with server in background
                    try {
                        const isValidSession = await authService.validateSession();
                        log('🔍 Session validation result:', isValidSession);

                        if (isValidSession) {
                            setSessionValidated(true);
                            log('✅ Session validated successfully');
                        } else {
                            log('❌ Session validation failed');
                            setUser(null);
                            setIsAuthenticated(false);
                            setSessionValidated(false);
                            addError({
                                type: 'SESSION_EXPIRED',
                                message: 'Your session has expired. Please log in again.',
                                critical: true
                            });
                        }
                    } catch (validationError) {
                        error('⚠️ Session validation error:', validationError);

                        // Don't logout on validation errors, just mark as not validated
                        setSessionValidated(false);
                        addError({
                            type: 'VALIDATION_ERROR',
                            message: 'Unable to validate session',
                            critical: false
                        });
                    }
                } else {
                    log('❌ User not authenticated locally');
                    setUser(null);
                    setIsAuthenticated(false);
                    setSessionValidated(false);
                }
            } catch (initError) {
                error('💥 Auth initialization error:', initError);
                setUser(null);
                setIsAuthenticated(false);
                setSessionValidated(false);
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
            log('📡 Auth state changed:', { isAuth, userData });
            setIsAuthenticated(isAuth);
            setUser(userData);
            if (!isAuth) {
                setSessionValidated(false);
            }
        });

        return removeListener;
    }, []);

    // FIXED: Login function
    const login = async (credentials) => {
        try {
            setLoading(true);
            clearAllErrors();
            log('🔑 Attempting login:', credentials.username);

            const response = await authService.login(credentials);

            // The authService now handles storing token and user data
            // and notifies listeners, so our state should be updated automatically
            log('✅ Login successful:', response);

            return response;
        } catch (error) {
            error('💥 Login failed:', error);
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
        log('👋 Logging out, redirect:', redirect);

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
            log('📝 Attempting registration:', userData.username);
            return await authService.register(userData);
        } catch (error) {
            error('💥 Registration failed:', error);
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
            log('🔐 Attempting password change');
            const result = await authService.changePassword(passwordData);
            addError({
                type: 'SUCCESS',
                message: 'Password changed successfully',
                critical: false
            });
            return result;
        } catch (error) {
            error('💥 Password change failed:', error);
            addError({
                type: 'PASSWORD_CHANGE_ERROR',
                message: error.message || 'Password change failed',
                critical: false
            });
            throw error;
        }
    };

    const refreshSession = async () => {
        if (!isAuthenticated) {
            return false;
        }

        try {
            setLoading(true);
            const isValid = await authService.validateSession();

            if (!isValid) {
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
            error('💥 Session refresh failed:', error);
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
        addError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;