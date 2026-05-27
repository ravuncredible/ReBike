import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminContext = createContext({});

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      setAdminUser(JSON.parse(savedAdmin));
    }
  }, []);

  const loginAdmin = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data || data.password !== password) {
         throw new Error('Username หรือ Password ไม่ถูกต้อง');
      }

      setAdminUser(data);
      localStorage.setItem('adminUser', JSON.stringify(data));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AdminContext.Provider value={{ adminUser, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
