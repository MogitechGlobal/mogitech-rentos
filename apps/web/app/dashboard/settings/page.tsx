// apps/web/app/dashboard/settings/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Building2, Sliders, PlugZap, ShieldCheck,
    Camera, Zap, Save, Loader2, Settings, LifeBuoy,
    ArrowRight, KeyRound, Bell, CreditCard, Landmark,
    AlertCircle, CheckCircle2, Key, Eye, EyeOff, X, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        companyAddress: '',
        currency: 'KSH',
        notifications: true,
        twoFactorAuth: false,
        currentPassword: '',
        newPassword: '',
        avatarBase64: ''
    });

    // --- UNIFIED PAYMENT GATEWAY STATE ---
    const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [isSavingGateway, setIsSavingGateway] = useState(false);
    
    const [gatewayType, setGatewayType] = useState<'BANK' | 'MPESA'>('BANK');
    const [selectedBank, setSelectedBank] = useState('KCB');
    
    const [gatewayData, setGatewayData] = useState({
        shortcode: '',
        consumerKey: '',
        consumerSecret: '',
        passkey: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, { credentials: 'include' });
                if (res.status === 401 || res.status === 403) return router.push('/login');

                if (res.ok) {
                    const data = await res.json();
                    
                    setFormData(prev => ({
                        ...prev,
                        firstName: data?.user?.first_name || '',
                        lastName: data?.user?.last_name || '',
                        email: data?.user?.email || '',
                        phone: data?.contact_phone || '',
                        companyName: data?.company_name || '',
                        companyAddress: data?.business_address || '',
                        currency: 'KSH',
                        notifications: true,
                        twoFactorAuth: false,
                    }));

                    if (data?.user?.avatar_url) setAvatarPreview(data.user.avatar_url);

                    // Hydrate Gateway Credentials
                    setGatewayType(data?.gateway_type === 'MPESA' ? 'MPESA' : 'BANK');
                    setSelectedBank(data?.bank_name || 'KCB');
                    setGatewayData({
                        shortcode: data?.mpesa_shortcode || '',
                        consumerKey: data?.kcb_consumer_key || '',
                        consumerSecret: data?.kcb_consumer_secret || '',
                        passkey: data?.mpesa_passkey || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setStatusMsg({ type: 'error', text: 'Image is too large (Max 10MB).' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > height) { if (width > 256) { height = Math.round((height * 256) / width); width = 256; } } 
                else { if (height > 256) { width = Math.round((width * 256) / height); height = 256; } }

                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
                    const base64 = canvas.toDataURL('image/webp', 0.8);
                    setAvatarPreview(base64);
                    setFormData(prev => ({ ...prev, avatarBase64: base64 }));
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMsg(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify(formData)
            });

            if (res.status === 401 || res.status === 403) return router.push('/login');
            const data = await res.json();

            if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message[0] : data.message);

            setStatusMsg({ type: 'success', text: 'Settings updated successfully!' });
            useUserStore.getState().fetchProfile();
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMsg(null), 4000);
        }
    };

    const handleSaveGateway = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingGateway(true);
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    gatewayType,
                    bankName: gatewayType === 'BANK' ? selectedBank : null,
                    mpesaShortcode: gatewayData.shortcode,
                    kcbConsumerKey: gatewayData.consumerKey,
                    kcbConsumerSecret: gatewayData.consumerSecret,
                    mpesaPasskey: gatewayType === 'MPESA' ? gatewayData.passkey : null
                })
            });

            if (!res.ok) throw new Error('Failed to save Gateway credentials.');

            setIsGatewayModalOpen(false);
            setStatusMsg({ type: 'success', text: 'Payment Gateway configured successfully! Webhooks are now active.' });
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message });
        } finally {
            setIsSavingGateway(false);
            setTimeout(() => setStatusMsg(null), 4000);
        }
    };

    const tabs = [
        { id: 'profile', name: 'User Profile', icon: User, desc: 'Personal details' },
        { id: 'company', name: 'Company', icon: Building2, desc: 'Business & branding' },
        { id: 'preferences', name: 'Preferences', icon: Sliders, desc: 'Global system rules' },
        { id: 'integrations', name: 'Integrations', icon: PlugZap, desc: 'Banks & M-Pesa APIs' },
        { id: 'security', name: 'Security', icon: ShieldCheck, desc: 'Passwords & 2FA' },
    ];

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";
    const labelStyle = "block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden relative">

            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 py-12 md:py-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border border-white/20 backdrop-blur-sm">
                        <Settings className="w-4 h-4" /> System Configuration
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-3 md:mb-4">
                        Account Settings
                    </h1>
                    <p className="text-teal-100 text-sm md:text-lg font-medium max-w-2xl">
                        Manage your profile, company details, integrations, and global security preferences.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-8 relative z-20 flex flex-col lg:flex-row gap-6 md:gap-8">

                <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 self-start">
                    <nav className="bg-[#ffffff] rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-lg shadow-black/5 border border-gray-100 flex flex-row lg:flex-col gap-1 md:gap-2 overflow-x-auto lg:overflow-visible hide-scrollbar scroll-smooth">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    type="button"
                                    className={`flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-left transition-all duration-200 group shrink-0
                                        ${isActive ? 'bg-[#ebf3f5] text-[#1f8898]' : 'hover:bg-gray-50 text-gray-600'}
                                    `}
                                >
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200
                                        ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}
                                    `}>
                                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                    <div className="pr-2 lg:pr-0">
                                        <p className={`text-sm md:text-base font-black tracking-tight ${isActive ? 'text-[#1f8898]' : 'text-gray-900'}`}>
                                            {tab.name}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5 hidden lg:block">{tab.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="hidden lg:block bg-[#ffffff] rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center mb-4">
                            <LifeBuoy className="w-5 h-5 text-[#1f8898]" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1 tracking-tight">Need Assistance?</h3>
                        <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">
                            Check out our official documentation for setup guides.
                        </p>
                        <Link href="/dashboard/help" className="w-full bg-gray-50 hover:bg-[#ebf3f5] text-[#1f8898] font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm border border-gray-100">
                            Visit Help Center <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </aside>

                <div className="flex-1 bg-[#ffffff] rounded-2xl md:rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden relative min-h-[500px]">

                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                            <div className="flex flex-col items-center text-[#1f8898] gap-3">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <span className="font-bold text-sm uppercase tracking-widest">Loading preferences...</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveChanges} className="h-full flex flex-col">

                            <div className="flex-1 p-6 sm:p-8 md:p-10">

                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">User Profile</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Manage your personal identity and contact info.</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-gray-50/50 p-5 md:p-6 rounded-2xl border border-gray-100">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#ffffff] rounded-2xl flex items-center justify-center text-[#1f8898] border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-6 h-6 md:w-8 md:h-8 opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 md:px-5 py-2 md:py-2.5 bg-[#ffffff] border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-700 hover:text-[#1f8898] hover:border-[#1f8898]/30 transition-all shadow-sm mb-2 active:scale-95">Upload New Avatar</button>
                                                <p className="text-[10px] md:text-xs text-gray-400 font-medium">Auto-resized to 256x256px.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                            <div>
                                                <label className={labelStyle}>First Name</label>
                                                <input type="text" className={inputStyle} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Last Name</label>
                                                <input type="text" className={inputStyle} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Email Address</label>
                                                <input type="email" disabled className="w-full rounded-xl border border-gray-100 px-4 py-3 outline-none bg-gray-100 text-gray-400 cursor-not-allowed font-medium text-sm" value={formData.email} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Phone Number</label>
                                                <input type="tel" className={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* COMPANY TAB */}
                                {activeTab === 'company' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Company Details</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">This information appears on tenant invoices and receipts.</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-5 md:gap-6">
                                            <div>
                                                <label className={labelStyle}>Registered Business Name</label>
                                                <input type="text" className={inputStyle} value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Business Address</label>
                                                <textarea rows={4} className={`${inputStyle} resize-none`} value={formData.companyAddress} onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PREFERENCES TAB */}
                                {activeTab === 'preferences' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">System Preferences</h2>
                                        </div>
                                        <div className="space-y-5 md:space-y-6">
                                            <div>
                                                <label className={labelStyle}>Default Currency</label>
                                                <select className={inputStyle} value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                                                    <option value="KSH">Kenyan Shilling (KES)</option>
                                                    <option value="USD">US Dollar (USD)</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                                                        <Bell className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm">Email Notifications</h4>
                                                        <p className="text-xs text-gray-500 font-medium">Alerts for new payments and tickets.</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer sm:ml-auto">
                                                    <input type="checkbox" className="sr-only peer" checked={formData.notifications} onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })} />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1f8898]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* INTEGRATIONS TAB - UPDATED */}
                                {activeTab === 'integrations' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Payment Gateways</h2>
                                                <p className="text-sm text-gray-500 font-medium mt-1">Connect MogiRentOS with Banks and Mobile Money for Direct Settlement.</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setIsGatewayModalOpen(true)}
                                                className="bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                                            >
                                                <PlugZap className="w-4 h-4" /> Configure Gateway
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5 md:gap-6">
                                            {/* Unified Gateway Card */}
                                            <div className="bg-gradient-to-br from-[#113a3f] to-[#1f8898] text-[#ffffff] rounded-2xl md:rounded-3xl shadow-xl overflow-hidden relative group p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ffffff]/10 rounded-full blur-2xl group-hover:bg-[#ffffff]/20 transition-all duration-500"></div>
                                                
                                                <div className="relative z-10 flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-[#ffffff]/20 rounded-2xl backdrop-blur-sm shadow-inner flex items-center justify-center shrink-0">
                                                        {gatewayType === 'BANK' ? <Landmark className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight mb-1">
                                                            {gatewayType === 'BANK' ? `${selectedBank} Direct API` : 'M-Pesa Daraja API'}
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${gatewayData.consumerKey ? 'text-[#ebf3f5]' : 'text-rose-200'}`}>
                                                                <span className={`w-2 h-2 rounded-full ${gatewayData.consumerKey ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span> 
                                                                {gatewayData.consumerKey ? 'Live Webhooks Active' : 'Not Configured'}
                                                            </p>
                                                            {gatewayData.shortcode && (
                                                                <span className="bg-[#ffffff]/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest border border-white/10">
                                                                    ID: {gatewayData.shortcode}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsGatewayModalOpen(true)}
                                                    className="w-full sm:w-auto bg-[#ffffff] hover:bg-gray-50 text-[#113a3f] font-black py-3 px-6 rounded-xl transition duration-200 shadow-sm flex items-center justify-center gap-2 text-sm active:scale-95 relative z-10 shrink-0"
                                                >
                                                    <Sliders className="w-4 h-4" /> Manage Settings
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECURITY TAB */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Security</h2>
                                        </div>
                                        <div className="max-w-md space-y-5 md:space-y-6">
                                            <div>
                                                <label className={labelStyle}>Current Password</label>
                                                <div className="relative">
                                                    <input type="password" placeholder="••••••••" className={inputStyle} value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} />
                                                    <KeyRound className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>New Password</label>
                                                <input type="password" placeholder="••••••••" className={inputStyle} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sticky Save Footer */}
                            <div className="p-5 md:p-6 lg:px-10 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                                <div className="flex-1 w-full">
                                    {statusMsg && (
                                        <div className={`px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-4
                                            ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}
                                        `}>
                                            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                            <span className="font-bold text-xs md:text-sm">{statusMsg.text}</span>
                                        </div>
                                    )}
                                </div>
                                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-3.5 bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2 text-sm md:text-base">
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Preferences</>}
                                </button>
                            </div>

                        </form>
                    )}
                </div>
            </main>

            {/* --- UNIFIED GATEWAY CONFIGURATION MODAL --- */}
            {isGatewayModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#ffffff] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 md:p-8 pb-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center border border-[#1f8898]/20 shadow-sm">
                                    <PlugZap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Configure Gateway</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Select your Direct Settlement integration.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsGatewayModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                            
                            {/* INTEGRATION TYPE SELECTOR */}
                            <div className="flex gap-3 mb-6">
                                <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center
                                    ${gatewayType === 'BANK' ? 'border-[#1f8898] bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <input type="radio" className="hidden" checked={gatewayType === 'BANK'} onChange={() => setGatewayType('BANK')} />
                                    <Landmark className="w-6 h-6" />
                                    <span className="text-xs font-black uppercase tracking-widest">Bank API</span>
                                </label>
                                <label className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center
                                    ${gatewayType === 'MPESA' ? 'border-[#1f8898] bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                                    <input type="radio" className="hidden" checked={gatewayType === 'MPESA'} onChange={() => setGatewayType('MPESA')} />
                                    <Smartphone className="w-6 h-6" />
                                    <span className="text-xs font-black uppercase tracking-widest">M-Pesa API</span>
                                </label>
                            </div>

                            <form id="gateway-form" onSubmit={handleSaveGateway} className="space-y-5">
                                
                                {gatewayType === 'BANK' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="mb-5">
                                            <label className={labelStyle}>Select Partner Bank</label>
                                            <select 
                                                className={`${inputStyle} font-bold text-gray-900 cursor-pointer`}
                                                value={selectedBank}
                                                onChange={(e) => setSelectedBank(e.target.value)}
                                            >
                                                <option value="KCB">KCB Bank (Buni API)</option>
                                                <option value="EQUITY" disabled>Equity Bank (Coming Soon)</option>
                                                <option value="COOP" disabled>Co-operative Bank (Coming Soon)</option>
                                                <option value="NCBA" disabled>NCBA Bank (Coming Soon)</option>
                                            </select>
                                        </div>

                                        {selectedBank === 'KCB' && (
                                            <>
                                                <div className="mb-5">
                                                    <label className={labelStyle}>Biller Shortcode / Till</label>
                                                    <input type="text" required placeholder="e.g. 522533" className={inputStyle} value={gatewayData.shortcode} onChange={(e) => setGatewayData({ ...gatewayData, shortcode: e.target.value })} />
                                                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">The KCB Paybill your tenants will pay to.</p>
                                                </div>
                                                <div className="mb-5">
                                                    <label className={labelStyle}>KCB Consumer Key</label>
                                                    <input type="text" required className={inputStyle} value={gatewayData.consumerKey} onChange={(e) => setGatewayData({ ...gatewayData, consumerKey: e.target.value })} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">KCB Consumer Secret</label>
                                                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-[10px] font-bold text-[#1f8898] flex items-center gap-1">
                                                            {showSecrets ? <><EyeOff className="w-3 h-3"/> Hide</> : <><Eye className="w-3 h-3"/> Show</>}
                                                        </button>
                                                    </div>
                                                    <input type={showSecrets ? "text" : "password"} required className={inputStyle} value={gatewayData.consumerSecret} onChange={(e) => setGatewayData({ ...gatewayData, consumerSecret: e.target.value })} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {gatewayType === 'MPESA' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="mb-5">
                                            <label className={labelStyle}>Safaricom Shortcode</label>
                                            <input type="text" required placeholder="e.g. 174379" className={inputStyle} value={gatewayData.shortcode} onChange={(e) => setGatewayData({ ...gatewayData, shortcode: e.target.value })} />
                                        </div>
                                        <div className="mb-5">
                                            <label className={labelStyle}>Daraja Consumer Key</label>
                                            <input type="text" required className={inputStyle} value={gatewayData.consumerKey} onChange={(e) => setGatewayData({ ...gatewayData, consumerKey: e.target.value })} />
                                        </div>
                                        <div className="mb-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Daraja Consumer Secret</label>
                                                <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-[10px] font-bold text-[#1f8898] flex items-center gap-1">
                                                    {showSecrets ? <><EyeOff className="w-3 h-3"/> Hide</> : <><Eye className="w-3 h-3"/> Show</>}
                                                </button>
                                            </div>
                                            <input type={showSecrets ? "text" : "password"} required className={inputStyle} value={gatewayData.consumerSecret} onChange={(e) => setGatewayData({ ...gatewayData, consumerSecret: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>Passkey</label>
                                            <input type={showSecrets ? "text" : "password"} required className={inputStyle} value={gatewayData.passkey} onChange={(e) => setGatewayData({ ...gatewayData, passkey: e.target.value })} />
                                            <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">Found in your Safaricom Daraja Portal.</p>
                                        </div>
                                    </div>
                                )}

                            </form>
                        </div>

                        <div className="p-5 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setIsGatewayModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" form="gateway-form" disabled={isSavingGateway} className="px-6 py-2.5 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                                {isSavingGateway ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSavingGateway ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}