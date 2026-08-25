import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, LogOut, Building2, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
            <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Activity className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-100">PulseMetrics</span>
            </div>

            <div className="flex items-center space-x-4">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                </button>

                {user && (
                    <>
                        <div className="hidden sm:flex items-center space-x-2 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">{user.organizationName}</span>
                        </div>

                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user.fullName}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>

                        <button
                            onClick={logout}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};