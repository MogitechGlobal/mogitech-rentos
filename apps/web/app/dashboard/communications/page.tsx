// apps/web/app/dashboard/communications/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
    Send, Loader2, ShieldAlert, 
    CheckCircle2, Megaphone, History, 
    Search, Users, Building2, AlertTriangle, 
    Info, Clock, Smartphone, Mail, CalendarClock,
    Eye, Inbox, Activity, User, Target, Layers
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

// --- FIX: Add @ts-ignore to suppress the TypeScript warning for CSS imports ---
// @ts-ignore
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="h-32 flex items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
});

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'clean']
    ],
};

export default function CommunicationsPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- UI States ---
    const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'history'>('compose');
    const [searchQuery, setSearchQuery] = useState('');
    const [localAnnouncements, setLocalAnnouncements] = useState<any[]>([]);
    const [systemAnnouncements, setSystemAnnouncements] = useState<any[]>([]);

    // --- Compose Form States ---
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error'|'info', text: string} | null>(null);
    
    // Advanced Targeting
    const [targetType, setTargetType] = useState<'ALL' | 'PROPERTY' | 'TENANT'>('ALL');
    const [targetId, setTargetId] = useState(''); // Property ID or Tenant ID depending on type
    
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [urgency, setUrgency] = useState('INFO');
    
    const [channels, setChannels] = useState({ portal: true, email: true, sms: false });

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const reqOptions = { credentials: 'include' as RequestCredentials };
                
                // Fetch Properties, Tenants, and System Announcements in parallel
                const [propRes, tenantRes, sysRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, reqOptions),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, reqOptions),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/system-announcements`, reqOptions)
                ]);
                
                if (propRes.status === 401 || tenantRes.status === 401) return router.push('/login');
                
                if (propRes.ok) {
                    const data = await propRes.json();
                    setProperties(data);
                    
                    // Flatten announcements for history
                    const allAnnouncements = data.flatMap((p: any) => 
                        (p.announcements || []).map((a: any) => ({ ...a, targetName: p.name }))
                    ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setLocalAnnouncements(allAnnouncements);
                }

                if (tenantRes.ok) {
                    const data = await tenantRes.json();
                    setTenants(data.filter((t: any) => t.is_active)); // Only active tenants
                }

                if (sysRes.ok) {
                    setSystemAnnouncements(await sysRes.json());
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [router]);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!channels.portal && !channels.email && !channels.sms) {
            return setStatusMsg({ type: 'error', text: 'You must select at least one delivery channel.' });
        }
        if (!message || message === '<p><br></p>') {
            return setStatusMsg({ type: 'error', text: 'Message body cannot be empty.' });
        }

        setIsSubmitting(true);
        setStatusMsg(null);

        const payload = {
            targetType,
            targetId: targetType === 'ALL' ? null : targetId,
            subject,
            message,
            urgency,
            channels
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communications/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.message || 'Failed to dispatch communication.');
            
            setStatusMsg({ type: 'success', text: 'Message dispatched successfully!' });
            
            // --- NEW: INSTANTLY UPDATE THE HISTORY TAB ---
            if (responseData.announcement) {
                const targetNameStr = targetType === 'ALL' ? 'Portfolio Wide' : 
                                      targetType === 'PROPERTY' ? properties.find(p => p.id === targetId)?.name : 
                                      'Individual Tenant';
                
                setLocalAnnouncements(prev => [{
                    ...responseData.announcement,
                    targetName: targetNameStr
                }, ...prev]);
            }
            
            // Reset form
            setSubject('');
            setMessage('');
            setTargetType('ALL');
            setTimeout(() => setStatusMsg(null), 5000);
            
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate Estimated Reach dynamically based on selection
    const estimatedReach = useMemo(() => {
        if (targetType === 'ALL') return tenants.length;
        if (targetType === 'TENANT') return targetId ? 1 : 0;
        if (targetType === 'PROPERTY') {
            const prop = properties.find(p => p.id === targetId);
            return prop ? prop.units?.flatMap((u: any) => u.tenants).filter((t: any) => t.is_active).length || 0 : 0;
        }
        return 0;
    }, [targetType, targetId, tenants, properties]);

    const filteredAnnouncements = useMemo(() => {
        if (!searchQuery) return localAnnouncements;
        const q = searchQuery.toLowerCase();
        return localAnnouncements.filter(a => 
            a.title?.toLowerCase().includes(q) || 
            a.message?.toLowerCase().includes(q) ||
            a.targetName?.toLowerCase().includes(q)
        );
    }, [localAnnouncements, searchQuery]);

    const getUrgencyColors = (type: string) => {
        switch (type) {
            case 'EMERGENCY': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: <ShieldAlert className="w-5 h-5" /> };
            case 'WARNING': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <AlertTriangle className="w-5 h-5" /> };
            case 'INFO': 
            default: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: <Info className="w-5 h-5" /> };
        }
    };

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Comms Hub...</p>
            </div>
        );
    }

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            <div className="bg-gradient-to-br from-[#0d393f] to-[#1f8898] px-6 pt-10 pb-24 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Megaphone className="w-3.5 h-3.5" /> Communications Hub
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                            Tenant Outreach
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                            Send targeted emails, portal notices, and SMS alerts to specific residents or your entire portfolio.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                
                <div className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col min-h-[700px]">
                    
                    {/* --- TAB NAVIGATION --- */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 pr-4 overflow-x-auto custom-scrollbar">
                        <div className="flex shrink-0">
                            <button 
                                onClick={() => setActiveTab('inbox')}
                                className={`px-5 md:px-7 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
                                    ${activeTab === 'inbox' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Inbox className="w-4 h-4" /> Inbox 
                                {systemAnnouncements.length > 0 && (
                                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md text-[10px] ml-1">{systemAnnouncements.length}</span>
                                )}
                            </button>
                            <button 
                                onClick={() => setActiveTab('compose')}
                                className={`px-5 md:px-7 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
                                    ${activeTab === 'compose' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <Send className="w-4 h-4" /> Compose Message
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-5 md:px-7 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap
                                    ${activeTab === 'history' ? `border-[#1f8898] text-[#1f8898] bg-white` : 'border-transparent text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <History className="w-4 h-4" /> Sent Log
                            </button>
                        </div>
                    </div>

                    {statusMsg && (
                        <div className={`m-6 p-4 rounded-xl border flex items-center gap-3 font-bold text-sm animate-in fade-in zoom-in-95 shadow-sm
                            ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              statusMsg.type === 'info' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'}
                        `}>
                            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
                             statusMsg.type === 'info' ? <Info className="w-5 h-5 shrink-0" /> :
                             <ShieldAlert className="w-5 h-5 shrink-0" />}
                            <span>{statusMsg.text}</span>
                        </div>
                    )}

                    {/* --- VIEW: INBOX (SYSTEM ANNOUNCEMENTS) --- */}
                    {activeTab === 'inbox' && (
                        <div className="flex flex-col flex-1 animate-in fade-in duration-300 bg-gray-50/30">
                            <div className="p-6 flex-1 overflow-y-auto">
                                {systemAnnouncements.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                            <Inbox className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-gray-900 font-black text-lg">Inbox is Empty</h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">You have no system notices from MogiRentOS administration.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {systemAnnouncements.map((ann) => (
                                            <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 border-l-4 hover:shadow-md transition-shadow relative overflow-hidden" style={{ borderLeftColor: ann.is_urgent ? '#e11d48' : '#1f8898' }}>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                                                        <Activity className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1 pt-0.5">
                                                        <h4 className="font-black text-gray-900 text-lg mb-1">{ann.title}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                            <span>MogiRentOS Admin</span> • <Clock className="w-3 h-3" /> {new Date(ann.created_at).toLocaleDateString()}
                                                        </p>
                                                        <div className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                                                            {ann.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- VIEW: COMPOSE (NEW ENGINE) --- */}
                    {activeTab === 'compose' && (
                        <form onSubmit={handleBroadcast} className="flex flex-col flex-1 animate-in fade-in duration-300 relative">
                            <div className="flex flex-col lg:flex-row flex-1">
                                
                                {/* Compose Area */}
                                <div className="flex-1 p-6 md:p-8 space-y-6 border-r border-gray-100">
                                    
                                    {/* Subject Line */}
                                    <div>
                                        <input 
                                            type="text" required placeholder="Subject / Notice Title" 
                                            className="w-full border-b-2 border-transparent hover:border-gray-200 focus:border-[#1f8898] outline-none py-2 text-2xl font-black text-gray-900 transition-colors placeholder:text-gray-300" 
                                            value={subject} onChange={e => setSubject(e.target.value)} 
                                        />
                                    </div>

                                    {/* Rich Text Editor */}
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden [&_.quill]:h-[300px] [&_.ql-container]:border-none [&_.ql-container]:text-sm [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50">
                                        <ReactQuill theme="snow" value={message} onChange={setMessage} modules={quillModules} placeholder="Type your message here..." />
                                    </div>

                                </div>

                                {/* Settings Sidebar */}
                                <div className="w-full lg:w-80 bg-gray-50/50 p-6 md:p-8 flex flex-col gap-8 shrink-0">
                                    
                                    {/* Target Selection */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2"><Target className="w-3.5 h-3.5"/> 1. Select Target</label>
                                        <div className="space-y-2">
                                            <button type="button" onClick={() => setTargetType('ALL')} className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${targetType === 'ALL' ? 'bg-white border-[#1f8898] text-[#1f8898] shadow-sm ring-1 ring-[#1f8898]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                <Layers className="w-4 h-4" /> <span className="font-bold text-sm">Entire Portfolio</span>
                                            </button>
                                            <button type="button" onClick={() => { setTargetType('PROPERTY'); setTargetId(''); }} className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${targetType === 'PROPERTY' ? 'bg-white border-[#1f8898] text-[#1f8898] shadow-sm ring-1 ring-[#1f8898]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                <Building2 className="w-4 h-4" /> <span className="font-bold text-sm">Specific Property</span>
                                            </button>
                                            <button type="button" onClick={() => { setTargetType('TENANT'); setTargetId(''); }} className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${targetType === 'TENANT' ? 'bg-white border-[#1f8898] text-[#1f8898] shadow-sm ring-1 ring-[#1f8898]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                <User className="w-4 h-4" /> <span className="font-bold text-sm">Individual Tenant</span>
                                            </button>
                                        </div>

                                        {targetType === 'PROPERTY' && (
                                            <div className="mt-3 animate-in slide-in-from-top-2">
                                                <select required className={inputStyle} value={targetId} onChange={e => setTargetId(e.target.value)}>
                                                    <option value="">Select Property...</option>
                                                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        {targetType === 'TENANT' && (
                                            <div className="mt-3 animate-in slide-in-from-top-2">
                                                <select required className={inputStyle} value={targetId} onChange={e => setTargetId(e.target.value)}>
                                                    <option value="">Select Resident...</option>
                                                    {tenants.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.unit?.property?.name})</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <span className="text-xs font-bold text-blue-800">Estimated Reach:</span>
                                            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-black">{estimatedReach}</span>
                                        </div>
                                    </div>

                                    {/* Channels */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2"><Send className="w-3.5 h-3.5"/> 2. Delivery Channels</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input type="checkbox" checked={channels.portal} onChange={(e) => setChannels({...channels, portal: e.target.checked})} className="w-4 h-4 text-[#1f8898] rounded focus:ring-[#1f8898]" />
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Megaphone className="w-4 h-4 text-gray-400"/> Portal Notice</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                <input type="checkbox" checked={channels.email} onChange={(e) => setChannels({...channels, email: e.target.checked})} className="w-4 h-4 text-[#1f8898] rounded focus:ring-[#1f8898]" />
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400"/> Email Blast</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors opacity-50" title="Requires SMS Gateway Setup">
                                                <input type="checkbox" disabled checked={channels.sms} onChange={(e) => setChannels({...channels, sms: e.target.checked})} className="w-4 h-4 text-[#1f8898] rounded focus:ring-[#1f8898]" />
                                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2"><Smartphone className="w-4 h-4 text-gray-400"/> SMS Text</span>
                                            </label>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <div className="p-5 md:p-6 border-t border-gray-100 bg-white flex justify-end shrink-0 sticky bottom-0">
                                <button 
                                    type="submit" disabled={isSubmitting || estimatedReach === 0} 
                                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-3.5 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 bg-[#1f8898] hover:bg-[#1a7684] shadow-[#1f8898]/20"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} 
                                    {isSubmitting ? 'Dispatching...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- VIEW: HISTORY --- */}
                    {activeTab === 'history' && (
                        <div className="flex flex-col flex-1 animate-in fade-in duration-300">
                            <div className="p-4 md:p-6 border-b border-gray-100 bg-white">
                                <div className="relative">
                                    <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" placeholder="Search past announcements..." 
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f8898] text-sm font-medium"
                                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 md:p-6 bg-gray-50/30 flex-1 overflow-y-auto">
                                {localAnnouncements.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                            <History className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-gray-900 font-black text-lg">No Broadcast History</h3>
                                        <p className="text-sm font-medium text-gray-500 mt-1">Messages you send will appear here.</p>
                                    </div>
                                ) : filteredAnnouncements.length === 0 ? (
                                    <div className="text-center py-12"><p className="text-sm font-bold text-gray-400">No records match your search.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredAnnouncements.map((ann) => {
                                            const colors = getUrgencyColors(ann.type || 'INFO');

                                            return (
                                                <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 group hover:border-[#1f8898]/30 transition-all">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                        {colors.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                                                            <h4 className="font-black text-gray-900 group-hover:text-[#1f8898] transition-colors truncate">{ann.title}</h4>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex flex-wrap items-center gap-3">
                                                            <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-gray-600"><Target className="w-3 h-3" /> {ann.targetName || 'Portfolio Wide'}</span>
                                                        </p>
                                                        <div 
                                                            className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: ann.message }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}