// apps/web/app/super-admin/integrations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { KeySquare, Smartphone, Landmark, CheckCircle2, Save, Loader2 } from 'lucide-react';

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
        
        let payloadProvider = gatewayType === 'MPESA' ? 'MPESA' : selectedBank;
        let payloadConfig = gatewayType === 'MPESA' ? adminFormData : (bankCredentials[selectedBank] || { clientId: '', clientSecret: '' });

        if (gatewayType === 'BANK_TRANSFER' && !selectedBank) {
            alert('Please select a bank to configure.');
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
            alert('Global Integration Saved Successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to save integration');
        } finally {
            setIsSavingGateway(false);
        }
    };

    const formInputStyle = "w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all font-medium text-sm text-gray-900 shadow-sm placeholder:text-gray-400";
    const labelStyle = "block text-[11px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider";

    const hasMpesaConfig = adminFormData.kcbConsumerKey && adminFormData.kcbConsumerSecret;
    const hasCurrentBankConfig = selectedBank && bankCredentials[selectedBank]?.clientId && bankCredentials[selectedBank]?.clientSecret;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col max-w-5xl">
            <div className="md:hidden">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Payment Gateways</h2>
                <p className="text-sm text-gray-500 font-medium">Configure global APIs.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                
                {/* LEFT COLUMN: Selection Area */}
                <div className="w-full lg:w-1/3 space-y-4 shrink-0">
                    <h3 className="text-sm font-bold text-gray-900">1. Select Gateway Provider</h3>
                    <div className="space-y-3">
                        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${gatewayType === 'MPESA' ? 'border-[#1f8898] bg-[#1f8898]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <input type="radio" name="gateway" className="sr-only" checked={gatewayType === 'MPESA'} onChange={() => { setGatewayType('MPESA'); setSelectedBank(''); }} />
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${gatewayType === 'MPESA' ? 'border-[#1f8898]' : 'border-gray-300'}`}>
                                {gatewayType === 'MPESA' && <div className="w-2 h-2 rounded-full bg-[#1f8898]" />}
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900 text-sm">M-Pesa API</span>
                                <span className="text-xs text-gray-500 block mt-0.5">Safaricom Daraja Integration</span>
                            </div>
                        </label>

                        <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${gatewayType === 'BANK_TRANSFER' ? 'border-[#1f8898] bg-[#1f8898]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <input type="radio" name="gateway" className="sr-only" checked={gatewayType === 'BANK_TRANSFER'} onChange={() => setGatewayType('BANK_TRANSFER')} />
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${gatewayType === 'BANK_TRANSFER' ? 'border-[#1f8898]' : 'border-gray-300'}`}>
                                {gatewayType === 'BANK_TRANSFER' && <div className="w-2 h-2 rounded-full bg-[#1f8898]" />}
                            </div>
                            <div>
                                <span className="block font-semibold text-gray-900 text-sm">Bank Open APIs</span>
                                <span className="text-xs text-gray-500 block mt-0.5">Direct Bank Settlement Hooks</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* RIGHT COLUMN: Configuration Area */}
                <div className="w-full lg:w-2/3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
                        <KeySquare className="w-4 h-4 text-gray-500" /> 
                        <h3 className="font-semibold text-gray-900 text-sm">
                            2. Configuration Keys
                        </h3>
                    </div>

                    <form onSubmit={handleSaveGlobalGateway} className="p-6">
                        
                        {gatewayType === 'MPESA' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                {hasMpesaConfig ? (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-emerald-900 text-sm">Integration Active</h4>
                                            <p className="text-xs text-emerald-700">Safaricom Daraja API credentials are configured.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-5 border-b border-gray-100 pb-4">Enter your Safaricom Daraja Developer credentials to activate M-Pesa processing globally.</p>
                                )}
                                
                                <div>
                                    <label className={labelStyle}>Consumer Key</label>
                                    <input type="text" className={formInputStyle} value={adminFormData.kcbConsumerKey} onChange={(e) => setAdminFormData({ ...adminFormData, kcbConsumerKey: e.target.value })} required={gatewayType === 'MPESA'} />
                                </div>
                                <div>
                                    <label className={labelStyle}>Consumer Secret</label>
                                    <input type="password" placeholder="••••••••••••••••" className={formInputStyle} value={adminFormData.kcbConsumerSecret} onChange={(e) => setAdminFormData({ ...adminFormData, kcbConsumerSecret: e.target.value })} required={gatewayType === 'MPESA'} />
                                </div>
                                <div>
                                    <label className={labelStyle}>M-Pesa Passkey</label>
                                    <input type="password" placeholder="••••••••••••••••" className={formInputStyle} value={adminFormData.kcbPasskey} onChange={(e) => setAdminFormData({ ...adminFormData, kcbPasskey: e.target.value })} required={gatewayType === 'MPESA'} />
                                </div>
                            </div>
                        )}

                        {gatewayType === 'BANK_TRANSFER' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <label className={labelStyle}>Target Institution</label>
                                    <select className={`${formInputStyle} cursor-pointer`} value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required={gatewayType === 'BANK_TRANSFER'}>
                                        <option value="" disabled>-- Select a Bank --</option>
                                        {KENYAN_BANKS.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBank ? (
                                    <div className="space-y-5 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                        {hasCurrentBankConfig ? (
                                            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-emerald-900 text-sm">Integration Active</h4>
                                                    <p className="text-xs text-emerald-700">The {selectedBank} API is connected.</p>
                                                </div>
                                            </div>
                                        ) : (
                                             <p className="text-sm text-gray-500 mb-2">Provide API credentials for {selectedBank}.</p>
                                        )}
                                        <div>
                                            <label className={labelStyle}>API Client ID / Key</label>
                                            <input type="text" className={formInputStyle} value={bankCredentials[selectedBank]?.clientId || ''} onChange={(e) => handleBankFieldChange('clientId', e.target.value)} required={gatewayType === 'BANK_TRANSFER'} />
                                        </div>
                                        <div>
                                            <label className={labelStyle}>API Client Secret</label>
                                            <input type="password" placeholder="••••••••••••••••" className={formInputStyle} value={bankCredentials[selectedBank]?.clientSecret || ''} onChange={(e) => handleBankFieldChange('clientSecret', e.target.value)} required={gatewayType === 'BANK_TRANSFER'} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 flex flex-col items-center justify-center text-center rounded-lg bg-gray-50 border border-dashed border-gray-300">
                                        <Landmark className="w-6 h-6 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500">Select a bank to configure<br/>its API connection.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end">
                            <button type="submit" disabled={isSavingGateway || (gatewayType === 'BANK_TRANSFER' && !selectedBank)} className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#1f8898] hover:bg-[#1a7684] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSavingGateway ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSavingGateway ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}