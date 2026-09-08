import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Clapperboard } from 'lucide-react';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, role, getRolePath } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict Role-Based Access Control
  const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(role) || role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="cinema-glass rounded-3xl p-8 sm:p-12 border border-rose-500/40 max-w-lg w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              ROLE ACCESS RESTRICTED
            </span>
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit'] mt-3">
              Unauthorized Production Zone
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your active persona is currently set to <strong className="text-amber-400 uppercase">{role.replace('_', ' ')}</strong>. 
              This section is restricted to <strong>{allowedRoles.map(r => r.replace('_', ' ')).join(' or ')}</strong> roles.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={getRolePath(role)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to {role.replace('_', ' ')} Workspace
            </Link>
            <Link
              to="/settings"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              View RBAC Matrix
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
