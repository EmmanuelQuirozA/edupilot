// src/context/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext
} from 'react';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext();

/**
 * Custom hook to consume AuthContext
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);

  // Helper: read & decode token
  const loadUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setUserDetails(null);
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      // e.g. decoded = { role: "SCHOOL_ADMIN", schoolId:1, userId:3, sub:"AtzimbaD", iat:…, exp:… }
      // We trust these fields because the token is signed by the server.
      setUser({
        role:      decoded.role,
        schoolId:  decoded.schoolId,
        userId:    decoded.userId,
        username:  decoded.sub
      });
      setLoading(false);
      
      const userDetails = localStorage.getItem('user');
      if (userDetails) {
        setUserDetails(JSON.parse(userDetails));
      }
      setLoading(false);

      // schedule auto-logout at expiration
      const expiresIn = decoded.exp * 1000 - Date.now();
      setTimeout(() => {
        logout();
      }, expiresIn);
    } catch (err) {
      console.error('Invalid token:', err);
      logout();
    }
  };

  useEffect(() => {
    loadUserFromToken();
    // Also re-load if someone manually replaces the token
    window.addEventListener('storage', loadUserFromToken);
    return () => {
      window.removeEventListener('storage', loadUserFromToken);
    };
  }, []);

  const login = (data) => {
    // Save token and user data in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // decode and set
    const decoded = jwtDecode(data.token);
    setUser({
      role:     decoded.role,
      userId:   decoded.userId,
      schoolId: decoded.schoolId,
      username: decoded.sub,
    });
    setUserDetails(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // redirect to login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ userDetails, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
