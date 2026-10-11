import { createContext, useState, useContext } from 'react';

const UserContext = createContext();
const STORAGE_KEY = 'ecoscrap-user';

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export const UserProvider = ({ children }) => {
  // Real seeded user picked on the login screen; kept across page reloads.
  const [user, setUser] = useState(loadUser);

  const login = (selectedUser) => {
    setUser(selectedUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedUser)); } catch { /* ignore */ }
  };
  const logout = () => {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
