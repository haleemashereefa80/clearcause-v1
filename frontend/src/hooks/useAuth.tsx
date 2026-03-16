"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import api from '@/lib/api';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_staff: boolean;
    kyc_status: string;
    ngo_profile?: {
        org_name: string;
        is_approved: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const res = await api.get('/auth/me/');
                    setUser(res.data);
                } catch (err: any) {
                    console.error("Failed to load user", err);
                    // Only clear tokens if the server explicitly rejected them (401 or 403)
                    // Do NOT clear on Network Error or other server issues (500)
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('user');
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login/', { email, password });
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const register = async (data: any) => {
        const res = await api.post('/auth/register/', data);
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
