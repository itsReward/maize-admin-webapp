// src/context/AuthContext.jsx
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
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // First check if there's a token stored locally
                const isAuth = authService.isAuthenticated();

                if (isAuth) {
                    // Only validate with backend if we have a valid local token
                    try {
                        const isValid = await authService.validateSession();

                        if (isValid) {
                            const userData = authService.getUserData();
                            setUser(userData);
                            setIsAuthenticated(true);
                        } else {
                            // Session is invalid, clear everything
                            authService.logout();
                            setUser(null);
                            setIsAuthenticated(false);
                        }
                    } catch (validationError) {
                        console.error('Session validation failed:', validationError);
                        // If validation fails, still set local auth state but don't redirect
                        const userData = authService.getUserData();
                        setUser(userData);
                        setIsAuthenticated(true);
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authService.login(credentials);

            const userData = {
                userId: response.userId,
                username: response.username,
                loginTime: new Date().toISOString()
            };

            setUser(userData);
            setIsAuthenticated(true);

            return response;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        // Don't redirect here, let the logout method in authService handle it
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            return await authService.register(userData);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            return await authService.changePassword(passwordData);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        changePassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;