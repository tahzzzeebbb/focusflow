import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Set axios default header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Load user from token
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/auth/me`);
                setUser(response.data.user);
                // Also store user in localStorage for components that need it
                localStorage.setItem('adhd_user', JSON.stringify(response.data.user));
            } catch (error) {
                console.error('Auth error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('adhd_user');
                setToken(null);
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    // Signup function
    const signup = async (email, password, name) => {
        try {
            // Validate inputs
            if (!email || !password || !name) {
                return { success: false, error: 'All fields are required' };
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { success: false, error: 'Invalid email format' };
            }

            // Password strength validation
            if (password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            // Call backend API
            const response = await axios.post(`${API_URL}/auth/signup`, {
                email,
                password,
                fullName: name  // Changed from 'name' to 'fullName' to match backend
            });

            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('adhd_user', JSON.stringify(newUser));
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            setUser(newUser);

            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Signup failed' };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            // Validate inputs
            if (!email || !password) {
                return { success: false, error: 'Email and password are required' };
            }

            // Call backend API
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });

            const { token: newToken, user: loggedInUser } = response.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('adhd_user', JSON.stringify(loggedInUser));
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            setUser(loggedInUser);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.error || error.response?.data?.message || 'Login failed' };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adhd_user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        token,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};