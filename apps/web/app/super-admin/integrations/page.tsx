// apps/web/app/super-admin/integrations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
    KeySquare, Smartphone, Landmark, CheckCircle2, 
    Save, Loader2, PlugZap, Activity, Server, ShieldCheck, AlertCircle 
} from 'lucide-react';

const KENYAN_BANKS = [
    "KCB Bank (Kenya Commercial Bank)",
    "Equity Bank",
    "Co-operative Bank of Kenya",
    "NCBA Bank",
    "Standard Chartered Bank",
    "Absa Bank Kenya",
    "Stanbic Bank",
    "Diamond Trust Bank (DTB)",
    "I&M Bank",
    "Family Bank"
];

export default function IntegrationsPage() {
    const [gatewayType, setGatewayType] = useState<'MPESA' | 'BANK_TRANSFER'>('MPESA');
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [isSavingGateway, setIsSavingGateway] = useState(false);
    
    const [adminFormData, setAdminFormData] = useState({ kcbConsumerKey: '', kcbConsumerSecret: '', kcbPasskey: '' });
    const [bankCredentials, setBankCredentials] = useState<Record<string, { clientId: string, clientSecret: string }>>({});

    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchIntegrations = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/integrations`, { credentials: 'include' });
                if (res.ok) {
                    const integrations = await res.json();
                    const bankCreds: Record<string, { clientId: string, clientSecret: string }> = {};
                    
                    integrations.forEach((int: any) => {
                        if (int.provider === 'MPESA') {
                            setAdminFormData({
                                kcbConsumerKey: int.config.kcbConsumerKey || '',
                                kcbConsumerSecret: int.config.kcbConsumerSecret || '',
                                kcbPasskey: int.config.kcbPasskey || '',
                            });
                        } else {
                            bankCreds[int.provider] = {
                                clientId: int.config.clientId || '',
                                clientSecret: int.config.clientSecret || '',
                            };
                        }
                    });
                    setBankCredentials(bankCreds);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchIntegrations();
    }, []);

    const handleBankFieldChange = (field: 'clientId' | 'clientSecret', value: string) => {
        if (!selectedBank) return;
        setBankCredentials(prev => ({
            ...prev,
            [selectedBank]: { ...(prev[selectedBank] || { clientId: '', clientSecret: '' }), [field]: value }
        }));
    };

    const handleSaveGlobalGateway = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingGateway(true);
        setStatusMsg(null);
        
        let payloadProvider = gatewayType === 'MPESA' ? 'MPESA' : selectedBank;
        let payloadConfig = gatewayType === 'MPESA' ? adminFormData : (bankCredentials[selectedBank] || { clientId: '', clientSecret: '' });

        if (gatewayType === 'BANK_TRANSFER' && !selectedBank) {
            setStatusMsg({ type: 'error', text: 'Please select a bank to configure.' });
            setIsSavingGateway(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/integrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ provider: payloadProvider, config: payloadConfig })
            });

            if (!res.ok) throw new Error('Failed to save integration');
            setStatusMsg({ type: 'success', text: `${payloadProvider} Integration Saved Successfully!` });
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error.message || 'Failed to save integration' });
        } finally {
            setIsSavingGateway(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    // --- DERIVED METRICS ---
    const isMpesaActive = !!(adminFormData.kcbConsumerKey && adminFormData.kcbConsumerSecret);
    const activeBanksCount = Object.keys(bankCredentials).filter(k => bankCredentials[k].clientId && bankCredentials[k].clientSecret).length;
    const totalActive = (isMpesaActive ? 1 : 0) + activeBanksCount;

    const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all font-medium text-sm text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white shadow-sm placeholder:text-gray-400";
    const labelStyle = "block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1";

    const hasMpesaConfig = adminFormData.kcbConsumerKey && adminFormData.kcbConsumerSecret;
    const hasCurrentBankConfig = selectedBank && bankCredentials[selectedBank]?.clientId && bankCredentials[selectedBank]?.clientSecret;

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            {/* --- Premium Gradient Hero Area --- */}
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <PlugZap className="w-3.5 h-3.5" /> API Management
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Global Integrations
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Configure master API keys for payment gateways, SMS providers, and external services to enable platform-wide features.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                {/* --- Bento Box Analytics Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 text-right leading-tight">Total<br/>Connections</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalActive}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Active global APIs</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Safaricom<br/>Daraja</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">
                                {isMpesaActive ? 'Connected' : 'Offline'}
                            </h4>
                            <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                {isMpesaActive ? <CheckCircle2 className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                                {isMpesaActive ? 'M-Pesa IPNs Active' : 'Setup Required'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 text-right leading-tight">Banking<br/>Gateways</span>
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{activeBanksCount}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Bank APIs configured</p>
                        </div>
                    </div>
                </div>

                {statusMsg && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border ${statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-sm">{statusMsg.text}</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    
                    {/* LEFT COLUMN: Selection Area */}
                    <div className="w-full lg:w-1/3 space-y-4 shrink-0">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">1. Select Provider</h3>
                        <div className="space-y-3">
                            <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${gatewayType === 'MPESA' ? 'border-[#1f8898] bg-[#1f8898]/5 shadow-md shadow-[#1f8898]/10' : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'}`}>
                                <input type="radio" name="gateway" className="sr-only" checked={gatewayType === 'MPESA'} onChange={() => { setGatewayType('MPESA'); setSelectedBank(''); }} />
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${gatewayType === 'MPESA' ? 'border-[#1f8898]' : 'border-gray-300'}`}>
                                    {gatewayType === 'MPESA' && <div className="w-2.5 h-2.5 rounded-full bg-[#1f8898]" />}
                                </div>
                                <div>
                                    <span className="block font-black text-gray-900 text-base mb-1">M-Pesa API</span>
                                    <span className="text-xs font-medium text-gray-500 block leading-relaxed">Global Safaricom Daraja Integration for C2B and B2C.</span>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${gatewayType === 'BANK_TRANSFER' ? 'border-[#1f8898] bg-[#1f8898]/5 shadow-md shadow-[#1f8898]/10' : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'}`}>
                                <input type="radio" name="gateway" className="sr-only" checked={gatewayType === 'BANK_TRANSFER'} onChange={() => setGatewayType('BANK_TRANSFER')} />
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${gatewayType === 'BANK_TRANSFER' ? 'border-[#1f8898]' : 'border-gray-300'}`}>
                                    {gatewayType === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-[#1f8898]" />}
                                </div>
                                <div>
                                    <span className="block font-black text-gray-900 text-base mb-1">Bank Open APIs</span>
                                    <span className="text-xs font-medium text-gray-500 block leading-relaxed">Direct Bank Settlement Hooks for Tier 1 Kenyan Banks.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Configuration Area */}
                    <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-gray-200 shadow-lg shadow-black/5 overflow-hidden shrink-0">
                        <div className="px-6 md:px-8 py-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <KeySquare className="w-5 h-5" /> 
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 text-lg tracking-tight">
                                    2. Configuration Keys
                                </h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Secure API Credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveGlobalGateway} className="p-6 md:p-8">
                            
                            {gatewayType === 'MPESA' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    {hasMpesaConfig ? (
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl mb-6 shadow-sm">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-emerald-900 text-sm">Integration Active</h4>
                                                <p className="text-xs font-bold text-emerald-700/70 mt-0.5 uppercase tracking-widest">Safaricom Daraja API Ready</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-6">
                                            <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-gray-400" /> Enter your Daraja Developer credentials to activate M-Pesa.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className={labelStyle}>Consumer Key</label>
                                        <input type="text" className={inputStyle} value={adminFormData.kcbConsumerKey} onChange={(e) => setAdminFormData({ ...adminFormData, kcbConsumerKey: e.target.value })} required={gatewayType === 'MPESA'} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Consumer Secret</label>
                                        <input type="password" placeholder="••••••••••••••••" className={inputStyle} value={adminFormData.kcbConsumerSecret} onChange={(e) => setAdminFormData({ ...adminFormData, kcbConsumerSecret: e.target.value })} required={gatewayType === 'MPESA'} />
                                    </div>
                                    <div>
                                        <label className={labelStyle}>M-Pesa Passkey</label>
                                        <input type="password" placeholder="••••••••••••••••" className={inputStyle} value={adminFormData.kcbPasskey} onChange={(e) => setAdminFormData({ ...adminFormData, kcbPasskey: e.target.value })} required={gatewayType === 'MPESA'} />
                                    </div>
                                </div>
                            )}

                            {gatewayType === 'BANK_TRANSFER' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <label className={labelStyle}>Target Institution</label>
                                        <select className={`${inputStyle} cursor-pointer`} value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required={gatewayType === 'BANK_TRANSFER'}>
                                            <option value="" disabled>-- Select a Bank --</option>
                                            {KENYAN_BANKS.map(bank => (
                                                <option key={bank} value={bank}>{bank}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedBank ? (
                                        <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
                                            {hasCurrentBankConfig ? (
                                                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl mb-2 shadow-sm">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-emerald-900 text-sm">Integration Active</h4>
                                                        <p className="text-xs font-bold text-emerald-700/70 mt-0.5 uppercase tracking-widest">{selectedBank} API Connected</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-2">
                                                    <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                        <Server className="w-4 h-4 text-gray-400" /> Provide API credentials for {selectedBank}.
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <label className={labelStyle}>API Client ID / Key</label>
                                                <input type="text" className={inputStyle} value={bankCredentials[selectedBank]?.clientId || ''} onChange={(e) => handleBankFieldChange('clientId', e.target.value)} required={gatewayType === 'BANK_TRANSFER'} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>API Client Secret</label>
                                                <input type="password" placeholder="••••••••••••••••" className={inputStyle} value={bankCredentials[selectedBank]?.clientSecret || ''} onChange={(e) => handleBankFieldChange('clientSecret', e.target.value)} required={gatewayType === 'BANK_TRANSFER'} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-16 flex flex-col items-center justify-center text-center rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                                <Landmark className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <h3 className="text-gray-900 font-black text-lg mb-1">Awaiting Selection</h3>
                                            <p className="text-sm font-medium text-gray-500">Select a bank above to configure its API connection.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-6 mt-8 border-t border-gray-100 flex justify-end">
                                <button 
                                    type="submit" 
                                    disabled={isSavingGateway || (gatewayType === 'BANK_TRANSFER' && !selectedBank)} 
                                    className="w-full sm:w-auto px-8 py-3.5 text-sm font-black text-white bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    {isSavingGateway ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSavingGateway ? 'Saving Details...' : 'Deploy Configuration'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}