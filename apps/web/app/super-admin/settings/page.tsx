// apps/web/app/super-admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
    Settings, AlertTriangle, Loader2, Save, 
    Mail, Phone, FileText, CheckCircle2, 
    MessageSquare, Server, ShieldCheck, Zap
} from 'lucide-react';

export default function SystemSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [settings, setSettings] = useState({
        maintenance_mode: false,
        maintenance_message: '',
        support_email: '',
        support_phone: '',
        terms_conditions: ''
    });

    // --- QUICK TEMPLATES ---
    const messageTemplates = [
        { label: 'Standard', text: 'MogiRentOS is currently undergoing scheduled maintenance to improve your experience. We apologize for the inconvenience and will be back online shortly.' },
        { label: 'Time-Specific', text: 'We are currently upgrading our servers to serve you better. The platform will be unavailable for approximately 2 hours. Thank you for your patience!' },
        { label: 'Feature Upgrade', text: "We're rolling out exciting new features! MogiRentOS is temporarily offline for a scheduled system upgrade. We will be back up and running very soon." },
        { label: 'Emergency', text: 'MogiRentOS is currently undergoing emergency maintenance to ensure optimal performance and security for your data. Our engineers are working to restore access as quickly as possible.' }
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        maintenance_mode: data.maintenance_mode || false,
                        maintenance_message: data.maintenance_message || '',
                        support_email: data.support_email || '',
                        support_phone: data.support_phone || '',
                        terms_conditions: data.terms_conditions || ''
                    });
                }
            } catch (err) {
                console.error('Failed to load settings', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMsg(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(settings)
            });

            if (!res.ok) throw new Error('Failed to update system settings');
            setStatusMsg({ type: 'success', text: 'Platform configuration successfully updated and applied globally.' });
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Configuration...</p>
            </div>
        );
    }

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-24 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <Server className="w-3.5 h-3.5" /> Core Configuration
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Master Settings
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Control platform-wide behavior, manage global branding, and instantly enforce emergency maintenance modes.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {statusMsg && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-sm">{statusMsg.text}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* --- MAINTENANCE MODE (DANGER ZONE) --- */}
                    <div className={`p-6 md:p-8 rounded-3xl border transition-all duration-500 overflow-hidden relative group ${settings.maintenance_mode ? 'bg-rose-50/80 border-rose-200 shadow-rose-500/10 shadow-xl' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {settings.maintenance_mode && (
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full pointer-events-none animate-pulse"></div>
                        )}
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 border-b border-gray-100/50 pb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                                    <div className={`p-2 rounded-xl flex items-center justify-center transition-colors ${settings.maintenance_mode ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-amber-100 text-amber-600'}`}>
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    Server Maintenance Mode
                                </h3>
                                <p className={`text-sm font-medium mt-2 max-w-xl leading-relaxed ${settings.maintenance_mode ? 'text-rose-800' : 'text-gray-500'}`}>
                                    Enabling this instantly locks out all Landlords and Tenants from the platform. Only Super Admins will be permitted to log in.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2">
                                <input 
                                    type="checkbox" className="sr-only peer" 
                                    checked={settings.maintenance_mode}
                                    onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                            </label>
                        </div>

                        <div className={`relative z-10 transition-all duration-300 ${settings.maintenance_mode ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Public Login Block Message</label>
                            <textarea 
                                rows={3}
                                placeholder="e.g., We are currently upgrading our servers. Please check back in 1 hour." 
                                className={`${inputStyle} resize-none ${settings.maintenance_mode ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                                value={settings.maintenance_message}
                                onChange={(e) => setSettings({...settings, maintenance_message: e.target.value})}
                            />
                            
                            <div className="mt-4 bg-white/50 p-4 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5" /> Quick Insert Templates
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {messageTemplates.map((tpl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSettings({ ...settings, maintenance_message: tpl.text })}
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 border ${
                                                settings.maintenance_message === tpl.text 
                                                ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                                            }`}
                                        >
                                            {tpl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- PLATFORM BRANDING & LEGAL --- */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ebf3f5] rounded-full blur-3xl pointer-events-none opacity-50"></div>
                        
                        <div className="border-b border-gray-100 pb-5 relative z-10">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                Platform Identity & Legal
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mt-2">
                                These details populate dynamic fields across the Tenant and Landlord Help Centers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div>
                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    <Mail className="w-4 h-4" /> Global Support Email
                                </label>
                                <input 
                                    type="email" placeholder="support@mogitech.com" 
                                    className={inputStyle}
                                    value={settings.support_email} onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                    <Phone className="w-4 h-4" /> Global Contact Phone
                                </label>
                                <input 
                                    type="text" placeholder="+254 700 000 000" 
                                    className={inputStyle}
                                    value={settings.support_phone} onChange={(e) => setSettings({...settings, support_phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                                <FileText className="w-4 h-4" /> Master Terms & Conditions
                            </label>
                            <textarea 
                                rows={10} placeholder="Enter the official platform terms of service that all Landlords agree to..." 
                                className={`${inputStyle} resize-none`}
                                value={settings.terms_conditions} onChange={(e) => setSettings({...settings, terms_conditions: e.target.value})}
                            />
                            <p className="text-xs text-gray-400 font-bold mt-3 px-1 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" /> This legal text is injected into the compliance viewer for all authenticated users.
                            </p>
                        </div>
                    </div>

                    {/* --- FLOATING ACTION BAR --- */}
                    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                        <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-gray-200 pointer-events-auto max-w-sm w-full flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500 px-3 hidden sm:inline-block">Unsaved changes</span>
                            <button 
                                type="submit" disabled={isSaving} 
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSaving ? 'Applying...' : 'Deploy Settings'}
                            </button>
                        </div>
                    </div>
                    
                </form>
            </main>
        </div>
    );
}