import { useState, useEffect } from 'react';
import { ChevronDown, UserCheck, UserX, Shield, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { useStore, User, UserRole } from '@/lib/store';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import UserDetailModal from '../modals/UserDetailModal';

interface UsersTabProps {
  onRequiresPIN: () => void;
}

type RoleFilter = 'all' | 'buyers' | 'farmers';

export default function UsersTab({ onRequiresPIN }: UsersTabProps) {
  const { users: storeUsers } = useStore();
  const [users, setUsers] = useState<User[]>(storeUsers);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Real-time listener for users
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(fetchedUsers);
      },
      (error) => console.error('Error fetching users:', error)
    );

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'buyers') return user.role === 'buyer';
    if (roleFilter === 'farmers') return user.role === 'farmer';
    return true;
  });

  const handleUserAction = async (userId: string, action: 'approve' | 'reject' | 'disable') => {
    onRequiresPIN();
    setIsUpdating(userId);

    try {
      const userRef = doc(db, 'users', userId);
      let status;
      if (action === 'approve') status = 'approved';
      else if (action === 'reject') status = 'rejected';
      else status = 'disabled';

      await updateDoc(userRef, { status });
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: status as any } : u));
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleOpenUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      disabled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      farmer: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      buyer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return styles[role];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Filter by Role
          </label>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white pr-10 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="buyers">Buyers</option>
              <option value="farmers">Farmers</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="text-sm text-slate-400">
          Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-slate-400">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="glass-card p-4 hover:bg-slate-800/40 transition-all duration-300 border border-slate-700/50 rounded-lg group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* User Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleOpenUserDetail(user)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white hover:text-emerald-400 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadge(user.role)}`}
                    >
                      {user.role === 'farmer' && '🌾'}
                      {user.role === 'buyer' && '🛒'}
                      {user.role === 'admin' && '👨‍💼'}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(user.status)}`}
                    >
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                    {user.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-2">
                  {user.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUserAction(user.id, 'approve')}
                        disabled={isUpdating === user.id}
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {isUpdating === user.id ? (
                          <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'reject')}
                        disabled={isUpdating === user.id}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {user.status !== 'disabled' && user.status !== 'rejected' && (
                    <button
                      onClick={() => handleUserAction(user.id, 'disable')}
                      disabled={isUpdating === user.id}
                      className="p-2 bg-slate-600/20 hover:bg-slate-600/30 text-slate-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Disable"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    title="Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          user={selectedUser}
        />
      )}
    </div>
  );
}
