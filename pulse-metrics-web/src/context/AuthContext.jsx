import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('pulse_user');
        const storedToken = localStorage.getItem('pulse_token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const loginUser = (authData) => {
        localStorage.setItem('pulse_token', authData.token);
        localStorage.setItem('pulse_user', JSON.stringify({
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            organizationId: authData.organizationId,
            organizationName: authData.organizationName
        }));
        setUser(authData);
    };

    const logout = () => {
        localStorage.removeItem('pulse_token');
        localStorage.removeItem('pulse_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);