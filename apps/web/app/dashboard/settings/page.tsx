// apps/web/app/dashboard/settings/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, PlugZap, ShieldCheck,
    Camera, Zap, Save, Loader2, Bell, CreditCard, Landmark,
    AlertCircle, CheckCircle2, KeyRound, Eye, EyeOff, Smartphone,
    KeySquare, Lock
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Active Integrations State
    const [activeBanks, setActiveBanks] = useState<string[]>([]);

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
        twoFactor: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        
        // Gateway Config
        gatewayType: 'MPESA',
        
        // Distinct M-PESA State
        mpesaShortcode: '', 
        darajaConsumerKey: '',
        darajaConsumerSecret: '',
        mpesaPasskey: '',

        // Distinct BANK State
        bankName: '',
        bankPaybill: '',
        bankAccountNumber: '',
        bankConsumerKey: '',
        bankConsumerSecret: '',
    });

    const [showPasswords, setShowPasswords] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);
    const [isSavingGateway, setIsSavingGateway] = useState(false);

    const { profile, fetchProfile } = useUserStore();

    useEffect(() => {
        const loadProfileAndBanks = async () => {
            await fetchProfile();
            
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/active-banks`, { credentials: 'include' });
                if (res.ok) {
                    const banks = await res.json();
                    setActiveBanks(banks);
                }
            } catch (err) {
                console.error("Failed to load active banks:", err);
            }
            setIsLoading(false);
        };
        loadProfileAndBanks();
    }, []);

    // Populate form
    useEffect(() => {
        if (profile) {
            const landlordData = profile.landlord || profile || {};
            const userData = profile.user || profile || {};

            const isBank = landlordData.gateway_type === 'BANK_TRANSFER';

            setFormData(prev => ({
                ...prev,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                phone: landlordData.contact_phone || userData.phone || '',
                companyName: landlordData.company_name || '',
                companyAddress: landlordData.business_address || '',
                currency: landlordData.default_currency || 'KSH',
                notifications: userData.receive_notifications !== false,
                twoFactor: userData.requires_2fa || false,
                
                gatewayType: landlordData.gateway_type || 'MPESA',
                
                // Map to MPESA State
                mpesaShortcode: !isBank ? (landlordData.mpesa_shortcode || '') : '',
                darajaConsumerKey: !isBank ? (landlordData.kcb_consumer_key || '') : '',
                darajaConsumerSecret: !isBank ? (landlordData.kcb_consumer_secret || '') : '',
                mpesaPasskey: landlordData.mpesa_passkey || '',
                
                // Map to BANK State
                bankName: landlordData.bank_name || '',
                bankPaybill: isBank ? (landlordData.mpesa_shortcode || '') : '',
                bankAccountNumber: landlordData.bank_account_number || '', 
                bankConsumerKey: isBank ? (landlordData.kcb_consumer_key || '') : '',
                bankConsumerSecret: isBank ? (landlordData.kcb_consumer_secret || '') : '',
            }));

            if (userData.avatar_url) {
                setAvatarPreview(userData.avatar_url);
            }
        }
    }, [profile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMsg(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    companyName: formData.companyName,
                    companyAddress: formData.companyAddress,
                    currency: formData.currency,
                    avatarBase64: avatarPreview?.startsWith('data:image') ? avatarPreview : undefined,
                })
            });

            if (!res.ok) throw new Error('Failed to update profile');
            setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
            await fetchProfile(); 
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setStatusMsg({ type: 'error', text: 'New passwords do not match!' });
            return;
        }
        setIsSaving(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newPassword: formData.newPassword })
            });

            if (!res.ok) throw new Error('Failed to update password');
            setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    const handleSaveGateway = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingGateway(true);
        setStatusMsg(null);

        // Dynamically select payload depending on Gateway type so we don't save empty/wrong fields
        const isBank = formData.gatewayType === 'BANK_TRANSFER';
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/landlords/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    gatewayType: formData.gatewayType,
                    mpesaShortcode: isBank ? formData.bankPaybill : formData.mpesaShortcode,
                    bankName: isBank ? formData.bankName : null,
                    bankAccountNumber: isBank ? formData.bankAccountNumber : null,
                    consumerKey: isBank ? formData.bankConsumerKey : formData.darajaConsumerKey,
                    consumerSecret: isBank ? formData.bankConsumerSecret : formData.darajaConsumerSecret,
                    passkey: isBank ? null : formData.mpesaPasskey,
                })
            });

            if (!res.ok) throw new Error('Failed to save gateway config');
            await fetchProfile(); 
            setStatusMsg({ type: 'success', text: 'Payment Gateway & API Keys configured successfully!' });
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message });
        } finally {
            setIsSavingGateway(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" />
            </div>
        );
    }

    const inputStyle = "w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";
    const labelStyle = "block text-xs font-black text-[#0d393f] mb-1.5 uppercase tracking-widest";

    const tabs = [
        { id: 'profile', name: 'Profile & Company', icon: Building2 },
        { id: 'billing', name: 'Billing & Plan', icon: CreditCard },
        { id: 'security', name: 'Security', icon: ShieldCheck },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'integrations', name: 'Integrations', icon: PlugZap },
    ];

    const currentPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE';

    return (
        <div className="h-full flex flex-col md:flex-row overflow-hidden bg-white md:m-6 md:rounded-3xl md:border md:border-gray-200 md:shadow-sm">
            
            {/* --- SIDEBAR TABS --- */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-200 hidden md:block">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Settings</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Manage your account</p>
                </div>
                
                <nav className="flex md:flex-col gap-1 p-3 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                                    ${isActive ? 'bg-white text-[#1f8898] shadow-sm border border-gray-200/50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'}
                                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1f8898]' : 'text-gray-400'}`} />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white relative">
                
                {statusMsg && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm shadow-sm border animate-in fade-in slide-in-from-top-2
                        ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}
                    `}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <p>{statusMsg.text}</p>
                    </div>
                )}

                {/* 1. PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Profile & Company</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Update your personal details and how tenants see your business.</p>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-8">
                            <div className="flex items-center gap-6 p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white text-3xl font-black">
                                                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Profile Picture</h4>
                                    <p className="text-xs text-gray-500 mt-1 mb-3 font-medium">PNG, JPG up to 5MB.</p>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
                                        Change Avatar
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelStyle}>First Name</label>
                                    <input type="text" className={inputStyle} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Last Name</label>
                                    <input type="text" className={inputStyle} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                                </div>
                                <div>
                                    <label className={labelStyle}>Email Address</label>
                                    <input type="email" className={inputStyle} value={formData.email} disabled />
                                    <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase">Contact support to change email</p>
                                </div>
                                <div>
                                    <label className={labelStyle}>Phone Number</label>
                                    <input type="tel" className={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="space-y-6">
                                <h4 className="text-lg font-black text-gray-900">Company Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelStyle}>Company / Portfolio Name</label>
                                        <input type="text" className={inputStyle} value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelStyle}>Business Address</label>
                                        <input type="text" className={inputStyle} value={formData.companyAddress} onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} placeholder="e.g., 123 Main St, Nairobi" />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Default Currency</label>
                                        <select className={inputStyle} value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                                            <option value="KSH">KES - Kenyan Shilling</option>
                                            <option value="USD">USD - US Dollar</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={isSaving} className="px-6 py-3 bg-[#1f8898] hover:bg-[#1a7684] text-white font-bold rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all flex items-center gap-2 disabled:opacity-50">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* 2. BILLING TAB */}
                {activeTab === 'billing' && (
                    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Billing & Plans</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Manage your platform subscription and plan limits.</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#0d393f] to-[#135a65] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
                                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Current Plan
                                    </div>
                                    <h4 className="text-3xl font-black tracking-tight">{currentPlan} Plan</h4>
                                    <p className="text-white/70 font-medium text-sm mt-1">You are currently on the {currentPlan.toLowerCase()} tier.</p>
                                </div>
                                <div className="shrink-0">
                                    <button className="w-full md:w-auto px-6 py-3 bg-white text-[#0d393f] font-black rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                                        Upgrade Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Keep your account and portfolio data secure.</p>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-[#1f8898]" /> Change Password
                                </h4>
                            </div>
                            <form onSubmit={handleSavePassword} className="p-6 space-y-5 bg-gray-50/30">
                                <div>
                                    <label className={labelStyle}>Current Password</label>
                                    <div className="relative">
                                        <input type={showPasswords ? "text" : "password"} className={inputStyle} value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} required />
                                        <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelStyle}>New Password</label>
                                    <input type={showPasswords ? "text" : "password"} className={inputStyle} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} required minLength={8} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Confirm New Password</label>
                                    <input type={showPasswords ? "text" : "password"} className={inputStyle} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required minLength={8} />
                                </div>
                                <div className="pt-2">
                                    <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50">
                                        {isSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {/* 4. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Manage how you receive alerts and updates.</p>
                        </div>
                        <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
                            <p className="text-gray-500 text-sm font-medium">Notification preferences coming soon.</p>
                        </div>
                    </div>
                )}

                {/* 5. INTEGRATIONS TAB */}
                {activeTab === 'integrations' && (
                    <div className="max-w-5xl space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
                        <div>
                            <h3 className="text-2xl font-black text-[#0d393f] tracking-tight">Payment Integrations</h3>
                            <p className="text-gray-500 text-sm font-medium mt-1">Configure how you receive rent payments securely through the MogiRentOS platform.</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                            
                            {/* LEFT COLUMN: Selection Area */}
                            <div className="w-full lg:w-1/3 space-y-4 shrink-0">
                                <h3 className="font-bold text-gray-900 px-1">1. Collection Method</h3>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.gatewayType === 'MPESA' ? 'border-[#1f8898] bg-[#1f8898]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                        <input type="radio" name="gateway" className="sr-only" checked={formData.gatewayType === 'MPESA'} onChange={() => setFormData({ ...formData, gatewayType: 'MPESA' })} />
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${formData.gatewayType === 'MPESA' ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-gray-900 truncate">M-Pesa API</span>
                                            <span className="text-xs text-gray-500 font-medium truncate block">Platform Daraja Gateway</span>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all 
                                        ${activeBanks.length === 0 ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : 
                                          formData.gatewayType === 'BANK_TRANSFER' ? 'border-[#1f8898] bg-[#1f8898]/5 shadow-sm cursor-pointer' : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'}
                                    `}>
                                        <input type="radio" name="gateway" className="sr-only" 
                                            checked={formData.gatewayType === 'BANK_TRANSFER'} 
                                            onChange={() => setFormData({ ...formData, gatewayType: 'BANK_TRANSFER' })} 
                                            disabled={activeBanks.length === 0} 
                                        />
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${formData.gatewayType === 'BANK_TRANSFER' ? 'bg-[#1f8898] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            <Landmark className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block font-bold text-gray-900 truncate">Bank Transfer</span>
                                            <span className="text-xs text-gray-500 font-medium truncate block">Direct Bank Settlement</span>
                                        </div>
                                        {activeBanks.length === 0 && <span className="absolute -top-2 -right-2 text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-rose-200">Unavailable</span>}
                                    </label>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Configuration Area */}
                            <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                                        <KeySquare className="w-5 h-5 text-[#1f8898]" /> 
                                        2. Gateway & API Configuration
                                    </h3>
                                </div>

                                <form onSubmit={handleSaveGateway} className="p-5 md:p-8">
                                    
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-8">
                                        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                                        <p className="text-xs text-blue-800 font-medium">Your credentials are encrypted at rest using AES-256 and never exposed to the client interface.</p>
                                    </div>

                                    {/* =========================================
                                        STATE A: BANK TRANSFER
                                        ========================================= */}
                                    {formData.gatewayType === 'BANK_TRANSFER' && (
                                        <div className="space-y-8">
                                            
                                            <div className="space-y-5">
                                                <div>
                                                    <label className={labelStyle}>Select Integrated Bank</label>
                                                    <select 
                                                        className={`${inputStyle} cursor-pointer bg-white`} 
                                                        value={formData.bankName} 
                                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} 
                                                        required
                                                    >
                                                        <option value="" disabled>-- Choose your banking provider --</option>
                                                        {activeBanks.map(bank => (
                                                            <option key={bank} value={bank}>{bank}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className={labelStyle}>Bank Paybill Number</label>
                                                        <input type="text" placeholder="e.g. 522522" className={`${inputStyle} font-mono`} 
                                                            value={formData.bankPaybill} onChange={(e) => setFormData({ ...formData, bankPaybill: e.target.value })} required />
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>Bank Account Number</label>
                                                        <input type="text" placeholder="e.g. 0110000000" className={`${inputStyle} font-mono`} 
                                                            value={formData.bankAccountNumber} onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })} required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5 border-t border-gray-100 pt-8">
                                                <h4 className="font-black text-[#0d393f] text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-[#1f8898]" /> Bank API Credentials
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium">To enable automatic 1-Click STK push directly to your bank account, provide the Consumer Key and Secret from your Bank's developer portal (e.g., KCB Buni).</p>
                                                
                                                <div>
                                                    <label className={labelStyle}>Bank Consumer Key</label>
                                                    <input type="text" placeholder="e.g. 7JHFtULvcv66EhD0NB9wZE3Lg4oa" className={`${inputStyle} font-mono`} 
                                                        value={formData.bankConsumerKey} onChange={(e) => setFormData({ ...formData, bankConsumerKey: e.target.value })} required />
                                                </div>
                                                
                                                <div>
                                                    <label className={labelStyle}>Bank Consumer Secret</label>
                                                    <div className="relative">
                                                        <input type={showSecrets ? "text" : "password"} placeholder="Enter your secret key..." className={`${inputStyle} font-mono`} 
                                                            value={formData.bankConsumerSecret} onChange={(e) => setFormData({ ...formData, bankConsumerSecret: e.target.value })} required />
                                                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600">
                                                            {showSecrets ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* =========================================
                                        STATE B: MPESA DARAJA
                                        ========================================= */}
                                    {formData.gatewayType === 'MPESA' && (
                                        <div className="space-y-8">
                                            
                                            <div>
                                                <label className={labelStyle}>M-Pesa Paybill / Till</label>
                                                <input type="text" placeholder="e.g. 52533" className={`${inputStyle} font-mono max-w-sm`} 
                                                    value={formData.mpesaShortcode} onChange={(e) => setFormData({ ...formData, mpesaShortcode: e.target.value })} required />
                                            </div>

                                            <div className="space-y-5 border-t border-gray-100 pt-8">
                                                <h4 className="font-black text-[#0d393f] text-sm uppercase tracking-widest flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-[#1f8898]" /> Safaricom Daraja API Keys
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium">To enable automatic 1-Click STK push for your tenants, provide the Consumer Key, Secret, and Passkey from your Safaricom Daraja developer portal.</p>
                                                
                                                <div>
                                                    <label className={labelStyle}>Daraja Consumer Key</label>
                                                    <input type="text" placeholder="e.g. H1uuE0yyw1KNfMv2UVAcBER480Ia" className={`${inputStyle} font-mono`} 
                                                        value={formData.darajaConsumerKey} onChange={(e) => setFormData({ ...formData, darajaConsumerKey: e.target.value })} required />
                                                </div>
                                                
                                                <div>
                                                    <label className={labelStyle}>Daraja Consumer Secret</label>
                                                    <div className="relative">
                                                        <input type={showSecrets ? "text" : "password"} placeholder="Enter your secret key..." className={`${inputStyle} font-mono`} 
                                                            value={formData.darajaConsumerSecret} onChange={(e) => setFormData({ ...formData, darajaConsumerSecret: e.target.value })} required />
                                                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600">
                                                            {showSecrets ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={labelStyle}>M-Pesa Passkey</label>
                                                    <div className="relative">
                                                        <input type={showSecrets ? "text" : "password"} placeholder="Enter your Daraja Passkey..." className={`${inputStyle} font-mono`} 
                                                            value={formData.mpesaPasskey} onChange={(e) => setFormData({ ...formData, mpesaPasskey: e.target.value })} required />
                                                        <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600">
                                                            {showSecrets ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TENANT PREVIEW (FALLBACK INSTRUCTIONS) */}
                                    <div className="bg-[#fff9eb] border border-[#fde5b4] p-6 rounded-2xl mt-10 shadow-sm">
                                        <p className="text-[11px] font-black uppercase tracking-widest text-[#b45309] mb-2">Direct Payment Fallback</p>
                                        <p className="text-sm text-[#92400e] font-medium mb-4">If a tenant's automatic STK push fails (e.g. no network), they will be instructed to pay manually using:</p>
                                        <div className="bg-white/80 p-5 rounded-xl border border-[#fde5b4]/50 space-y-2.5">
                                            <p className="text-sm text-[#78350f] font-medium">1. Go to M-Pesa Menu &gt; Lipa na M-Pesa &gt; Paybill</p>
                                            <p className="text-sm text-[#78350f] font-medium">2. Business No: <strong className="font-black text-[#1f8898]">{formData.gatewayType === 'BANK_TRANSFER' ? (formData.bankPaybill || '[Paybill]') : (formData.mpesaShortcode || '[Paybill]')}</strong></p>
                                            <p className="text-sm text-[#78350f] font-medium">3. Account No: <strong className="font-black text-[#1f8898]">{formData.gatewayType === 'BANK_TRANSFER' && formData.bankAccountNumber ? formData.bankAccountNumber : "[Tenant's Unit Number]"}</strong></p>
                                        </div>
                                    </div>

                                    <div className="pt-8 mt-6 border-t border-gray-100">
                                        <button type="submit" disabled={isSavingGateway} className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                                            {isSavingGateway ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {isSavingGateway ? 'Saving Configuration...' : 'Save Configuration'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}