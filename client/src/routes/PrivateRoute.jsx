import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protege rotas que exigem login.
// Enquanto valida o usuário, exibe uma mensagem simples para evitar redirecionamento indevido.
export function PrivateRoute({ children }) {
    const { isAuthenticated, isLoadingUser } = useAuth();

    if (isLoadingUser) {
        return <p style={{ padding: '24px' }}>Loading...</p>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}