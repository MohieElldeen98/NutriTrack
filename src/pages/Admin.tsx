import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Users, CreditCard, Activity, Search, ShieldAlert, Crown, UserX } from 'lucide-react';
import { collection, query, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Quick protection jump
  if (user?.email !== 'pt.mohie@gmail.com') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), limit(100)); // Increased limit slightly
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleVIP = async (userId: string, currentPlan: string) => {
    setActionLoading(userId);
    try {
      const newPlan = (currentPlan === 'vip' || currentPlan === 'vip_monthly') ? 'free' : 'vip';
      await updateDoc(doc(db, 'users', userId), {
        plan: newPlan
      });
      // Update local state directly to avoid needing a full refetch immediately
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    } catch (err) {
      console.error("Failed to update VIP status", err);
      // alert won't work in iframe
    } finally {
      setActionLoading(null);
    }
  };

  const totalUsers = users.length;
  const vipUsers = users.filter(u => u.plan === 'vip' || u.plan === 'vip_monthly').length + 1; // +1 for the master account

  return (
    <div className="space-y-8 max-w-6xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dr. Mohie Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage users, subscriptions, and platform health.</p>
        </div>
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold text-sm tracking-wide">
          MASTER ADMIN
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{loading ? '-' : totalUsers}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active VIPs</p>
            <h3 className="text-2xl font-bold text-gray-900">{loading ? '-' : vipUsers}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Platform Status</p>
            <h3 className="text-xl font-bold text-emerald-600">Online & Securing</h3>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search by ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      {u.firstName || u.lastName ? (
                        <div className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                      ) : null}
                      <div className="text-sm font-medium text-gray-600">{u.email || 'Unknown Email'}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5" title="User ID">{u.id}</div>
                      {(u.age || u.weight) && (
                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                          {u.age && <span>{u.age}y</span>}
                          {u.weight && <span>{u.weight}kg</span>}
                          {u.height && <span>{u.height}cm</span>}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        u.plan === 'vip' || u.plan === 'vip_monthly' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.plan === 'vip' || u.plan === 'vip_monthly' ? 'VIP' : 'Free'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.email !== 'pt.mohie@gmail.com' ? (
                        <button 
                          onClick={() => toggleVIP(u.id, u.plan)}
                          disabled={actionLoading === u.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            u.plan === 'vip' || u.plan === 'vip_monthly'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === u.id ? (
                            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          ) : (u.plan === 'vip' || u.plan === 'vip_monthly') ? (
                            <>
                              <UserX size={14} />
                              <span className="hidden sm:inline">Remove VIP</span>
                            </>
                          ) : (
                            <>
                              <Crown size={14} />
                              <span className="hidden sm:inline">Make VIP</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Master</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
