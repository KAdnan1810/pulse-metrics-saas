import { useEffect, useState } from 'react';
import API from '../api/client';
import { Navbar } from '../components/Navbar';
import { Zap, ShieldCheck, Database, RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pinging, setPinging] = useState(false);
    const [pingStatus, setPingStatus] = useState(null);

    const fetchMetrics = async () => {
        try {
            const res = await API.get('/metrics/dashboard');
            setMetrics(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    const handleTestPing = async () => {
        setPinging(true);
        setPingStatus(null);
        try {
            const res = await API.post('/metrics/ping');
            setPingStatus({ type: 'success', msg: res.data });
            fetchMetrics(); // Refresh stats
        } catch (err) {
            setPingStatus({
                type: 'error',
                msg: err.response?.data || 'Rate limit exceeded or server error'
            });
            fetchMetrics();
        } finally {
            setPinging(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading live SaaS metrics...</div>;

    return (
        <div className="min-h-screen bg-slate-950 pb-12">
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 mt-8">
                {/* Top Action & Status Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">API Usage & Rate Limiting</h1>
                        <p className="text-sm text-slate-400">Real-time quota monitoring backed by Redis & PostgreSQL</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleTestPing}
                            disabled={pinging}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center space-x-2 transition disabled:opacity-50"
                        >
                            <Zap className="w-4 h-4" />
                            <span>{pinging ? 'Sending...' : 'Test API Request (Simulate Traffic)'}</span>
                        </button>

                        <button
                            onClick={fetchMetrics}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg transition"
                            title="Refresh Metrics"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {pingStatus && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center space-x-3 border ${pingStatus.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{pingStatus.msg}</span>
                    </div>
                )}

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Tier</span>
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{metrics?.planName}</p>
                        <p className="text-xs text-slate-500 mt-2">Renews: {new Date(metrics?.renewalDate).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Consumption</span>
                            <Database className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {metrics?.usedQuota} <span className="text-sm font-normal text-slate-400">/ {metrics?.monthlyQuota} calls</span>
                        </p>
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(metrics?.quotaUsagePercentage || 0, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quota Used</span>
                            <Zap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-3xl font-bold text-indigo-400">{metrics?.quotaUsagePercentage}%</p>
                        <p className="text-xs text-slate-500 mt-2">Redis atomic counter status: Active</p>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="font-semibold text-slate-200">Recent API Audit Logs</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Endpoint</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Response Time</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                {metrics?.recentLogs?.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No requests logged yet. Click 'Test API Request' above.</td>
                                    </tr>
                                ) : (
                                    metrics?.recentLogs?.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-slate-800/30">
                                            <td className="px-6 py-3 font-mono text-xs text-indigo-300">{log.endpoint}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.statusCode === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                    }`}>
                                                    {log.statusCode}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-400">{log.responseTimeMs}ms</td>
                                            <td className="px-6 py-3 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};