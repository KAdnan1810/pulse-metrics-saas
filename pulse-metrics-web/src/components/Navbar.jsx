import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, Building2 } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-100">PulseMetrics</span>
            </div>

            {user && (
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        <span className="font-medium text-slate-200">{user.organizationName}</span>
                    </div>

                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-200">{user.fullName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            )}
        </header>
    );
};