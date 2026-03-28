// apps/web/app/portal/documents/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FileText, Download, Loader2, AlertCircle, 
    Folder, ShieldCheck, CheckCircle2, FileImage, 
    FileSignature, FileSymlink
} from 'lucide-react';

export default function TenantDocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocuments = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/documents', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to load documents');
                
                const data = await res.json();
                setDocuments(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocuments();
    }, [router]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                    <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
                </div>
                <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Documents...</p>
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

    const getIcon = (category: string) => {
        switch (category) {
            case 'LEGAL': return <FileSignature className="w-6 h-6" />;
            case 'INSPECTION': return <FileImage className="w-6 h-6" />;
            default: return <FileText className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

            {/* --- Advanced Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Folder className="w-3.5 h-3.5" /> Document Center
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Lease & Policies
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Securely access your active lease agreement, house rules, and condition reports.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-[#ffffff] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md hover:border-[#1f8898]/30 transition-all duration-300 relative overflow-hidden">
                            
                            {/* Decorative Background Glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 bg-[#1f8898]/10 transition-opacity"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                        doc.category === 'LEGAL' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        doc.category === 'INSPECTION' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-[#ebf3f5] text-[#1f8898] border-[#1f8898]/20'
                                    }`}>
                                        {getIcon(doc.category)}
                                    </div>
                                    {doc.is_signed && (
                                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Signed
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{doc.category}</p>
                                <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight group-hover:text-[#1f8898] transition-colors mb-2">
                                    {doc.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mb-6">
                                    {doc.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added</span>
                                    <span className="text-xs font-black text-gray-700">
                                        {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#1f8898] text-gray-600 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-gray-200 hover:border-transparent">
                                    <Download className="w-4 h-4" /> {doc.size}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}