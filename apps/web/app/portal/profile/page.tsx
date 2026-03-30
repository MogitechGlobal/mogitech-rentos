// apps/web/app/portal/profile/page.tsx
/* eslint-disable */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, ShieldCheck, Camera, Save, Loader2, 
    Settings, LifeBuoy, ArrowRight, Mail, KeyRound, 
    Bell, AlertCircle, CheckCircle2, PhoneCall
} from 'lucide-react';
import Link from 'next/link';

export default function TenantProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        emergencyName: '',
        emergencyPhone: '',
        notifications: true,
        twoFactorAuth: false,
        currentPassword: '',
        newPassword: '',
        avatarBase64: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return router.push('/login');

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        firstName: data.first_name || '',
                        lastName: data.last_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        emergencyName: data.emergency_contact_name || '',
                        emergencyPhone: data.emergency_contact_phone || '',
                    }));
                    if (data?.user?.avatar_url) {
                        setAvatarPreview(data.user.avatar_url);
                    }
                }
            } catch (error) {
                console.error('Failed to load profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setStatusMsg({ type: 'error', text: 'Image is too large. Limit is 10MB.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIMENSION = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/webp', 0.8);

                    setAvatarPreview(compressedBase64);
                    setFormData(prev => ({ ...prev, avatarBase64: compressedBase64 }));
                    setStatusMsg(null);
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

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const responseData = await res.json();

            if (!res.ok) {
                const errorMessage = Array.isArray(responseData.message) ? responseData.message[0] : responseData.message || 'Failed to save.';
                setStatusMsg({ type: 'error', text: errorMessage });
                setIsSaving(false);
                return;
            }

            setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            setTimeout(() => setStatusMsg(null), 4000);

        } catch (error: any) {
            setStatusMsg({ type: 'error', text: 'A network error occurred.' });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'User Profile', icon: User, desc: 'Personal details' },
        { id: 'emergency', name: 'Emergency', icon: PhoneCall, desc: 'Contact points' },
        { id: 'security', name: 'Security', icon: ShieldCheck, desc: 'Passwords & auth' },
    ];

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";
    const labelStyle = "block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1";

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans overflow-x-hidden relative">

            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 py-12 md:py-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-4 md:mb-6 border border-white/20 backdrop-blur-sm">
                        <Settings className="w-4 h-4" /> Account Configuration
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-3 md:mb-4">
                        My Profile
                    </h1>
                    <p className="text-teal-100 text-sm md:text-lg font-medium max-w-2xl">
                        Manage your identity, emergency contacts, and account security.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-8 relative z-20 flex flex-col lg:flex-row gap-6 md:gap-8">

                <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 self-start">
                    <nav className="bg-[#ffffff] rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-lg shadow-black/5 border border-gray-100 flex flex-row lg:flex-col gap-1 md:gap-2 overflow-x-auto lg:overflow-visible hide-scrollbar">
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
                                        <p className={`text-sm md:text-base font-black tracking-tight ${isActive ? 'text-[#1f8898]' : 'text-gray-900'}`}>{tab.name}</p>
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
                        <p className="text-gray-500 text-sm mb-4 font-medium leading-relaxed">Reach out to your property manager.</p>
                        <Link href="/portal/support" className="w-full bg-gray-50 hover:bg-[#ebf3f5] text-[#1f8898] font-bold py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm border border-gray-100">
                            Visit Support <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </aside>

                <div className="flex-1 bg-[#ffffff] rounded-2xl md:rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden relative min-h-[400px]">

                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
                            <Loader2 className="w-10 h-10 animate-spin text-[#1f8898]" />
                        </div>
                    ) : (
                        <form onSubmit={handleSaveChanges} className="h-full flex flex-col">
                            <div className="flex-1 p-6 sm:p-8 md:p-10">

                                {/* PROFILE TAB */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Personal Details</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Manage your identity and contact info.</p>
                                        </div>

                                        <div className="flex items-center gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                            <div className="w-20 h-20 bg-[#ffffff] rounded-2xl flex items-center justify-center text-[#1f8898] border border-gray-200 shadow-sm overflow-hidden shrink-0">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-8 h-8 opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-[#ffffff] border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-[#1f8898] transition-all shadow-sm mb-2 active:scale-95">
                                                    Upload New Avatar
                                                </button>
                                                <p className="text-xs text-gray-400 font-medium">Auto-resized to 256x256px.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <input type="email" disabled className="w-full rounded-xl border border-gray-100 px-4 py-3 bg-gray-100 text-gray-400 cursor-not-allowed font-medium text-sm" value={formData.email} />
                                                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase">Contact PM to change email</p>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Phone Number</label>
                                                <input type="tel" className={inputStyle} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EMERGENCY CONTACT TAB */}
                                {activeTab === 'emergency' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Emergency Contact</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Who should we contact in case of an emergency?</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelStyle}>Contact Name</label>
                                                <input type="text" className={inputStyle} value={formData.emergencyName} onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })} placeholder="e.g. Jane Doe" />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>Contact Phone Number</label>
                                                <input type="tel" className={inputStyle} value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} placeholder="e.g. +254..." />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECURITY TAB */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Security</h2>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Update your password to keep your account secure.</p>
                                        </div>

                                        <div className="max-w-md space-y-6">
                                            <div>
                                                <label className={labelStyle}>Current Password</label>
                                                <div className="relative">
                                                    <input type="password" placeholder="••••••••" className={inputStyle} value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} />
                                                    <KeyRound className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>New Password</label>
                                                <div className="relative">
                                                    <input type="password" placeholder="••••••••" className={inputStyle} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">Must be at least 8 characters</p>
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

                                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-6 md:px-8 py-3.5 bg-[#1f8898] hover:bg-[#1a7684] text-[#ffffff] font-bold rounded-xl shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2 active:scale-95 text-sm md:text-base">
                                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Preferences</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}