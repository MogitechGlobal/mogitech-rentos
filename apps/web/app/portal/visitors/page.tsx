// apps/web/app/portal/visitors/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    KeySquare, Users, Truck, Wrench, 
    PlusCircle, Loader2, AlertCircle, 
    Clock, CheckCircle2, ShieldCheck, X, Copy, Check
} from 'lucide-react';

export default function TenantVisitorsPage() {
    const router = useRouter();
    const [passes, setPasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedPin, setCopiedPin] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        type: 'GUEST',
        expectedArrival: ''
    });

    const fetchPasses = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return router.push('/login');

        try {
            // FIXED: Replaced closing single quote with a backtick
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/gate-passes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load gate passes');
            
            const data = await res.json();
            setPasses(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPasses(); }, [router]);

    const handleCreatePass = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('access_token');

        try {
            // FIXED: Replaced closing single quote with a backtick
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/gate-passes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to generate gate pass');
            
            await fetchPasses(); // Refresh the list to show the new pass
            setIsModalOpen(false);
            setFormData({ visitorName: '', type: 'GUEST', expectedArrival: '' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (pin: string) => {
        navigator.clipboard.writeText(pin);
        setCopiedPin(pin);
        setTimeout(() => setCopiedPin(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Security Hub...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafb] p-6">
                <div className="max-w-md w-full p-8 bg-white border border-rose-100 shadow-xl shadow-rose-100/50 rounded-3xl text-center">
                    <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
                        <AlertCircle className="text-rose-600 w-8 h-8" />
                    </div>
                    <h2 className="text-gray-900 font-black text-2xl mb-2 tracking-tight">Access Error</h2>
                    <p className="text-gray-500 font-medium mb-8">{error}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const activePasses = passes.filter(p => p.status === 'ACTIVE');
    const pastPasses = passes.filter(p => p.status !== 'ACTIVE');

    const getTypeIcon = (type: string) => {
        if (type === 'DELIVERY') return <Truck className="w-5 h-5" />;
        if (type === 'SERVICE') return <Wrench className="w-5 h-5" />;
        return <Users className="w-5 h-5" />;
    };

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            {/* --- Advanced Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <ShieldCheck className="w-3.5 h-3.5" /> Security Access
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Visitor Management
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Generate temporary gate passes for your guests, deliveries, and service providers.
                        </p>
                    </div>

                    <div className="flex mt-4 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#ffffff] text-[#1f8898] hover:bg-gray-50 px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto"
                        >
                            <PlusCircle className="w-4 h-4" /> New Gate Pass
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-8">
                
                {/* --- ACTIVE PASSES --- */}
                <div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 ml-1 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active Passes
                    </h2>
                    
                    {activePasses.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                            <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-4 text-[#1f8898]">
                                <KeySquare className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900">No expected visitors.</h2>
                            <p className="text-gray-500 font-medium mt-2 text-sm max-w-sm">You do not have any active gate passes. Generate a new PIN when you expect someone.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {activePasses.map((pass) => (
                                <div key={pass.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden group">
                                    <div className="p-6 flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#ebf3f5] text-[#1f8898] rounded-xl flex items-center justify-center shrink-0">
                                                {getTypeIcon(pass.type)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{pass.type}</p>
                                                <h3 className="font-black text-gray-900 text-lg leading-tight tracking-tight">{pass.visitor_name}</h3>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="px-6 py-4 bg-gray-50 border-y border-gray-100 flex items-center justify-between">
                                        <div className="font-mono text-3xl font-black text-gray-900 tracking-[0.2em]">{pass.pin}</div>
                                        <button 
                                            onClick={() => copyToClipboard(pass.pin)}
                                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-[#ebf3f5] hover:border-[#1f8898]/30 hover:text-[#1f8898] transition-all text-gray-500"
                                            title="Copy PIN"
                                        >
                                            {copiedPin === pass.pin ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="p-4 bg-white flex items-center justify-between text-xs font-bold text-gray-500">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Expected: {new Date(pass.expected_arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Valid Today</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- PAST PASSES LEDGER --- */}
                {pastPasses.length > 0 && (
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 ml-1">History Log</h2>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
                                            <th className="px-6 md:px-8 py-4 align-middle">Visitor / Type</th>
                                            <th className="px-6 py-4 align-middle">Date</th>
                                            <th className="px-6 py-4 align-middle">PIN Code</th>
                                            <th className="px-6 md:px-8 py-4 text-right align-middle">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pastPasses.map((pass) => (
                                            <tr key={pass.id} className="hover:bg-gray-50/80 transition duration-150">
                                                <td className="px-6 md:px-8 py-4 align-middle">
                                                    <div className="font-bold text-gray-900 text-sm">{pass.visitor_name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{pass.type}</div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="text-sm font-medium text-gray-600">
                                                        {new Date(pass.expected_arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle font-mono font-bold text-gray-400 text-sm tracking-widest">
                                                    {pass.pin}
                                                </td>
                                                <td className="px-6 md:px-8 py-4 text-right align-middle">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${
                                                        pass.status === 'USED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}>
                                                        {pass.status === 'USED' && <CheckCircle2 className="w-3 h-3" />}
                                                        {pass.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- NEW GATE PASS MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                    <KeySquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight">Generate PIN</h2>
                                    <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">Authorize a visitor</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreatePass} className="p-6 md:p-8 space-y-5">
                            
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Visitor / Company Name</label>
                                <input 
                                    type="text" 
                                    required placeholder="e.g. Jane Doe or Glovo"
                                    className={inputStyle}
                                    value={formData.visitorName} 
                                    onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Visitor Type</label>
                                    <select 
                                        className={inputStyle}
                                        value={formData.type} 
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="GUEST">Guest / Family</option>
                                        <option value="DELIVERY">Delivery / Courier</option>
                                        <option value="SERVICE">Service / Repairs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Expected Arrival</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        className={inputStyle}
                                        value={formData.expectedArrival} 
                                        onChange={(e) => setFormData({...formData, expectedArrival: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="bg-[#ebf3f5] border border-[#1f8898]/20 p-4 rounded-xl flex gap-3 mt-2">
                                <ShieldCheck className="w-5 h-5 text-[#1f8898] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#0d393f] font-medium leading-relaxed">
                                    A single-use 6-digit PIN will be generated. It will automatically expire at midnight on the expected arrival date.
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-xl font-bold text-sm text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-60 active:scale-95">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Generate PIN
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}