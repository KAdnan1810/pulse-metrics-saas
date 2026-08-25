import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { Activity, ArrowRight } from 'lucide-react';

export const Register = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', organizationName: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/register', form);
            loginUser(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-2 text-indigo-500 mb-6">
                    <Activity className="w-6 h-6" />
                    <span className="text-xl font-bold text-white">PulseMetrics SaaS</span>
                </div>

                <h2 className="text-2xl font-bold mb-2">Create your workspace</h2>
                <p className="text-slate-400 text-sm mb-6">Start monitoring your API usage and subscriptions.</p>

                {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Organization / Company Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                            placeholder="e.g. Acme Corp"
                            value={form.organizationName}
                            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                            placeholder="Adnan Khan"
                            value={form.fullName}
                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Work Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                            placeholder="name@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                        <span>{loading ? 'Creating workspace...' : 'Get Started'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};