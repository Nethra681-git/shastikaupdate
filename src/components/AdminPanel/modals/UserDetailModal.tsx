import { X, Mail, Phone, MapPin, Building, CheckCircle, Clock } from 'lucide-react';
import { User } from '@/lib/store';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
}: UserDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">Role</p>
              <p className="font-semibold text-white capitalize">{user.role}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <p className="font-semibold text-white capitalize">{user.status}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">User Type</p>
              <p className="font-semibold text-white capitalize">{user.userType}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-1">Verified</p>
              <p className="font-semibold text-white flex items-center gap-1">
                {user.verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Yes
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-yellow-400" />
                    Pending
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-white break-all">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-white">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Country</p>
                  <p className="text-white">{user.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          {user.companyName && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Business Information</h3>
              <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <Building className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Company Name</p>
                  <p className="text-white">{user.companyName}</p>
                </div>
              </div>
            </div>
          )}

          {/* User ID */}
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-400 mb-1">User ID</p>
            <p className="text-sm text-slate-300 font-mono break-all">{user.id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
