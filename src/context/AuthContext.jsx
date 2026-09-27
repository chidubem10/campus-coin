import { createContext, useContext, useEffect, useState } from 'react';

const USERS_KEY = 'campuscoin_users';
const SESSION_KEY = 'campuscoin_session';

const AuthContext = createContext(null);

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionEmail = localStorage.getItem(SESSION_KEY);
    // Small deliberate delay so the loading screen is actually visible on load.
    const timer = setTimeout(() => {
      if (sessionEmail) {
        const users = loadUsers();
        const found = users.find((u) => u.email === sessionEmail);
        if (found) setCurrentUser(found);
      }
      setReady(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  function persistUser(updated) {
    const users = loadUsers();
    const next = users.map((u) => (u.email === updated.email ? updated : u));
    saveUsers(next);
    setCurrentUser(updated);
  }

  function signUp({ name, email, password, academicYear }) {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      initial: name.trim().charAt(0).toUpperCase() || '?',
      email: normalizedEmail,
      password,
      academicYear: academicYear || '',
      monthlyAllowanceBaseline: 0,
      savingsGoal: 0,
      createdAt: new Date().toISOString(),
    };
    const next = [...users, user];
    saveUsers(next);
    localStorage.setItem(SESSION_KEY, user.email);
    setCurrentUser(user);
    return { ok: true, user };
  }

  function logIn(email, password) {
    const users = loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email === normalizedEmail);
    if (!found || found.password !== password) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    localStorage.setItem(SESSION_KEY, found.email);
    setCurrentUser(found);
    return { ok: true, user: found };
  }

  function logOut() {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }

  function updateProfile(partial) {
    if (!currentUser) return;
    const updated = { ...currentUser, ...partial };
    if (partial.name) updated.initial = partial.name.trim().charAt(0).toUpperCase() || '?';
    persistUser(updated);
  }

  function deleteAccount() {
    if (!currentUser) return;
    const users = loadUsers().filter((u) => u.email !== currentUser.email);
    saveUsers(users);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(`campuscoin_finance_${currentUser.id}`);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, ready, signUp, logIn, logOut, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
