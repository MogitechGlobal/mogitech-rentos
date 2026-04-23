// apps/web/app/dashboard/audit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Clock, UserCircle, Loader2, Activity, Filter, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkspaceAuditLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/audit`, { credentials: 'include' });
                if (res.status === 401 || res.status === 403) return router.replace('/dashboard');
                
                if (res.ok) setLogs(await res.json());
            } catch (err) {
                console.error("Failed to load audit logs");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [router]);

    const getRoleBadge = (role: string) => {
        if (role === 'OWNER') return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-amber-200">OWNER</span>;
        if (role === 'FINANCE') return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-blue-200">FINANCE</span>;
        if (role === 'CARETAKER') return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-emerald-200">CARETAKER</span>;
        if (role === 'VENDOR') return <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-purple-200">VENDOR</span>;
        return <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border border-gray-200">{role}</span>;
    };

    const filteredLogs = logs.filter(log => 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-[#1f8898]" /> Workspace Audit Trail
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">An immutable ledger of all actions taken by your team.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-white shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Latest 200 Events</span>
                </div>
                
                {isLoading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 font-medium">No activity matching your search.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#ebf3f5] flex items-center justify-center shrink-0 border border-[#1f8898]/10">
                                        <UserCircle className="w-5 h-5 text-[#1f8898]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900 text-sm">{log.actor_name}</span>
                                            {getRoleBadge(log.actor_role)}
                                        </div>
                                        <p className="text-gray-700 text-sm font-medium">{log.description}</p>
                                        <div className="flex items-center gap-1.5 mt-2 opacity-70">
                                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 font-mono uppercase bg-gray-100 px-2 py-0.5 rounded">{log.action.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400 shrink-0 self-start sm:self-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}