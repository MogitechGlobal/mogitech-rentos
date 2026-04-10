// apps/web/app/super-admin/system/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
    Loader2, Server, Cpu, Database, Activity, 
    CheckCircle2, AlertTriangle, Clock, Play, 
    RefreshCcw, TerminalSquare, ShieldAlert
} from 'lucide-react';

export default function SystemHealthPage() {
    const [healthData, setHealthData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);

    const fetchSystemHealth = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/system-health`, { credentials: 'include' });
            if (res.ok) setHealthData(await res.json());
        } catch (err) {
            console.error('Failed to fetch system health', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchSystemHealth();
        const interval = setInterval(fetchSystemHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleManualTrigger = async (jobName: string) => {
        if (!confirm(`Manually execute ${jobName.replace(/_/g, ' ')}? This will run the script immediately.`)) return;
        setIsTriggering(true);
        try {
            // Reusing your seed route as the manual trigger for the SaaS billing
            let route = '';
            if (jobName === 'SAAS_BILLING_AUTOMATION') route = '/admin/billing/seed';
            
            if (!route) {
                alert('No manual trigger route defined for this job yet.');
                setIsTriggering(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${route}`, { method: 'POST', credentials: 'include' });
            if (res.ok) {
                alert('Job triggered successfully!');
                fetchSystemHealth();
            } else {
                throw new Error('Failed to trigger job');
            }
        } catch (err) {
            alert('Error triggering job.');
        } finally {
            setIsTriggering(false);
        }
    };

    if (isLoading && !healthData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pingng Server Instances...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <TerminalSquare className="w-3.5 h-3.5" /> DevOps & Infrastructure
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            System Health
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Monitor live server metrics, database latency, and automated background job executions.
                        </p>
                    </div>

                    <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <button 
                            onClick={fetchSystemHealth}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 w-full md:w-auto"
                        >
                            <RefreshCcw className="w-4 h-4" /> Refresh Metrics
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Server Metrics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* Database Status */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none ${healthData?.database.status === 'CONNECTED' ? 'bg-emerald-50' : 'bg-rose-50'}`}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${healthData?.database.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                <Database className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Neon<br/>Postgres</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className={`text-2xl font-black tracking-tight truncate ${healthData?.database.status === 'CONNECTED' ? 'text-gray-900' : 'text-rose-600'}`}>
                                {healthData?.database.status}
                            </h4>
                            <p className="text-xs text-gray-500 font-bold mt-1 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" /> Latency: {healthData?.database.latencyMs}ms
                            </p>
                        </div>
                    </div>

                    {/* API Server Uptime */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Server className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Node.js<br/>Environment</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                {Math.floor(healthData?.server.uptime / 3600)} Hours
                            </h4>
                            <p className="text-xs text-gray-500 font-bold mt-1 flex items-center gap-1">
                                OS: {healthData?.server.platform.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* CPU Load */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">1-Min<br/>Load Avg</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                {healthData?.server.cpuLoad}
                            </h4>
                            <p className="text-xs text-gray-500 font-bold mt-1">CPU Load Metric</p>
                        </div>
                    </div>

                    {/* RAM Usage */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Memory<br/>Usage</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate mb-2">
                                {healthData?.server.ramUsagePct}%
                            </h4>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${healthData?.server.ramUsagePct > 85 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${healthData?.server.ramUsagePct}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">
                                {healthData?.server.usedRamGB} GB / {healthData?.server.totalRamGB} GB
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Cron Job Automation Ledger --- */}
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    <div className="p-5 md:p-6 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#1f8898]" /> Automated Script Execution Log
                            </h3>
                            <p className="text-xs font-medium text-gray-500 mt-1">Real-time status of background cron jobs.</p>
                        </div>
                        
                        {/* Manual Trigger Quick Action */}
                        <button 
                            onClick={() => handleManualTrigger('SAAS_BILLING_AUTOMATION')}
                            disabled={isTriggering}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 active:scale-95"
                        >
                            {isTriggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Run SaaS Billing Now
                        </button>
                    </div>

                    <div className="overflow-x-auto flex-1 bg-white">
                        <table className="min-w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                    <th className="px-6 py-4 pl-8">Job Name / Routine</th>
                                    <th className="px-6 py-4">Execution Time</th>
                                    <th className="px-6 py-4">Result / Output</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {!healthData?.jobs || healthData.jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                                                <ShieldAlert className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Jobs Logged</h3>
                                            <p className="text-sm text-gray-500 font-medium">Background tasks have not executed yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    healthData.jobs.map((job: any) => (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                        <TerminalSquare className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm group-hover:text-[#1f8898] transition-colors">
                                                            {job.job_name.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                            {job.records_processed} Records Processed
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-900 font-bold mb-0.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    {new Date(job.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-5">
                                                    Duration: {job.duration_ms ? `${job.duration_ms}ms` : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-medium text-gray-600 max-w-sm truncate group-hover:text-gray-900 transition-colors" title={job.message}>
                                                    {job.message || 'No output message provided.'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border
                                                    ${job.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                    job.status === 'FAILED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                                    'bg-blue-50 text-blue-700 border-blue-200'}
                                                `}>
                                                    {job.status}
                                                </span>
                                            </td>
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
}