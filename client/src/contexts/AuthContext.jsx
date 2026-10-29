import { createContext, useContext, useEffect, useState } from 'react';
import {
    getAuthenticatedUser,
    loginUser,
    registerUser,
} from '../services/authService';

const AuthContext = createContext({});

// Centraliza o estado de autenticação da aplicação.
// Isso evita duplicar lógica de login, logout e usuário logado em vários componentes.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    async function loadUser() {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsLoadingUser(false);
            return;
        }

        try {
            const response = await getAuthenticatedUser();
            setUser(response.user);
        } catch {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoadingUser(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, []);

    async function login({ email, password }) {
        const response = await loginUser({ email, password });

        localStorage.setItem('token', response.token);
        setUser(response.user);

        return response.user;
    }

    async function register({ name, email, password }) {
        await registerUser({ name, email, password });

        // Após o cadastro, faz login automaticamente para melhorar o fluxo do usuário.
        return login({ email, password });
    }

    function logout() {
        localStorage.removeItem('token');
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoadingUser,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook simples para acessar os dados de autenticação em qualquer componente.
export function useAuth() {
    return useContext(AuthContext);
}