// apps/web/app/portal/documents/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FileText, Download, Loader2, AlertCircle, 
    Folder, ShieldCheck, CheckCircle2, FileImage, 
    FileSignature, Clock, PenTool, X, ExternalLink
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function TenantDocumentsPage() {
    const router = useRouter();
    const { profile } = useUserStore();
    
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // E-Sign / View Modal States
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [signature, setSignature] = useState('');
    const [hasExceptions, setHasExceptions] = useState(false);
    const [inspectionNotes, setInspectionNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/documents`, {
                credentials: 'include' 
            });
            
            if (res.status === 401 || res.status === 403) return router.push('/login');
            if (!res.ok) throw new Error('Failed to load documents');
            
            const data = await res.json();
            setDocuments(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [router]);

    // --- TENANT E-SIGN SUBMISSION ---
    const handleSignDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signature.trim() || !selectedDoc) return;
        if (hasExceptions && !inspectionNotes.trim()) {
            setStatusMsg({ type: 'error', text: 'Please list your exceptions or uncheck the box.' });
            return;
        }
        
        setIsSubmitting(true);
        setStatusMsg(null);

        try {
            const payload: any = { signature };
            if (selectedDoc.category === 'INSPECTION' && hasExceptions) {
                payload.notes = inspectionNotes;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/documents/${selectedDoc.id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to sign the document. Please try again.');

            setStatusMsg({ type: 'success', text: 'Document successfully signed!' });
            setIsDocModalOpen(false);
            setSignature('');
            setHasExceptions(false);
            setInspectionNotes('');
            await fetchDocuments(); 
        } catch (err: any) {
            setStatusMsg({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    // --- LEASE PDF GENERATOR ---
    const handleDownloadPDF = (doc: any) => {
        if (doc.type === 'CUSTOM_PDF' && doc.file_url) {
            window.open(doc.file_url, '_blank');
            return;
        }

        setStatusMsg({ type: 'info', text: 'Generating Official PDF...' });
        
        const companyName = doc.company_name || 'Tech Global Ltd'; 
        const tenantName = doc.tenant_name || 'Tenant';
        const docTitle = doc.title === 'Official Lease Agreement' ? 'OFFICIAL LEASE AGREEMENT' : doc.title;

        const tenantSig = doc.tenant_signature || 'Pending Signature';
        const landlordSig = doc.landlord_signature || 'Pending Approval';
        const tenantDate = doc.signed_at ? new Date(doc.signed_at).toLocaleDateString() : '';
        const landlordDate = doc.approved_at ? new Date(doc.approved_at).toLocaleDateString() : '';

        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${docTitle}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
                body { font-family: 'Inter', sans-serif; color: #111827; padding: 0; margin: 0; background: #ffffff; }
                .a4-container { max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
                
                .header-container { background-color: #113a3f !important; color: #ffffff !important; display: flex; justify-content: space-between; align-items: center; padding: 40px 50px; }
                .company-info h1 { font-size: 32px; font-weight: 800; margin: 0 0 5px 0; color: #ffffff !important; }
                .company-info p { font-size: 13px; color: #cbd5e1 !important; margin: 0; font-weight: 400; }
                .doc-type h2 { font-size: 20px; font-weight: 800; margin: 0; color: #ffffff !important; text-transform: uppercase; letter-spacing: 1px; text-align: right; }
                
                .content-body { padding: 50px; flex-grow: 1; font-size: 14px; line-height: 1.8; color: #374151; }
                .content-body h2 { color: #111827; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px; }
                .content-body p { margin-bottom: 15px; }
                .content-body strong { color: #111827; }
                
                .signatures { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
                .sig-box { flex: 1; }
                .sig-line { border-bottom: 2px solid #111827; margin-bottom: 10px; height: 40px; display: flex; align-items: flex-end; padding-bottom: 5px; font-family: 'Courier New', Courier, monospace; font-size: 18px; color: #047857; font-weight: bold; text-transform: uppercase; }
                .sig-label { font-size: 12px; font-weight: 800; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; }
                .sig-date { font-size: 10px; color: #6b7280; margin-top: 4px; font-weight: 600; }
                
                .footer { background-color: #f3f4f6 !important; text-align: center; padding: 20px 50px; margin-top: auto; }
                .footer p { margin: 0 0 5px 0; font-size: 10px; color: #6b7280; }
                .footer p.powered-by { font-weight: 600; color: #4b5563; margin-bottom: 0; }
              </style>
            </head>
            <body>
              <div class="a4-container">
                <div class="header-container">
                  <div class="company-info">
                    <h1>${companyName}</h1>
                    <p>Automated Property Management</p>
                  </div>
                  <div class="doc-type"><h2>${docTitle}</h2></div>
                </div>
                <div class="content-body">
                  ${doc.content || '<p>Official Document Details.</p>'}
                  ${doc.type === 'E-SIGN' ? `
                    <div class="signatures">
                        <div class="sig-box">
                        <div class="sig-line">${tenantSig}</div>
                        <div class="sig-label">Tenant Signature (${tenantName})</div>
                        <div class="sig-date">${tenantDate ? 'Date: ' + tenantDate : ''}</div>
                        </div>
                        <div class="sig-box">
                        <div class="sig-line">${landlordSig}</div>
                        <div class="sig-label">Landlord / Manager Signature</div>
                        <div class="sig-date">${landlordDate ? 'Date: ' + landlordDate : ''}</div>
                        </div>
                    </div>
                  ` : ''}
                </div>
                <div class="footer">
                  <p>This is a legally binding, computer-generated e-document.</p>
                  <p>Generated via MogiRentOS on ${new Date().toLocaleString()}</p>
                  <p class="powered-by">Powered by Mogitech Global Ltd</p>
                </div>
              </div>
            </body>
          </html>
        `;
    
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'absolute';
        printIframe.style.top = '-10000px';
        document.body.appendChild(printIframe);
    
        const printDocument = printIframe.contentWindow?.document;
        if (printDocument) {
          printDocument.open();
          printDocument.write(htmlContent);
          printDocument.close();
        }
    
        setTimeout(() => {
          setStatusMsg(null);
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            if (document.body.contains(printIframe)) document.body.removeChild(printIframe);
          }, 2000);
        }, 500);
    };

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
            case 'LEGAL': return <FileSignature className="w-6 h-6 text-amber-500" />;
            case 'INSPECTION': return <FileImage className="w-6 h-6 text-blue-500" />;
            default: return <FileText className="w-6 h-6 text-[#1f8898]" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

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
                
                {statusMsg && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border ${
                        statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                        statusMsg.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                        'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : 
                         statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : 
                         <Loader2 className="w-5 h-5 shrink-0 animate-spin" />}
                        <span className="font-bold text-sm flex-1">{statusMsg.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-[#ffffff] p-6 md:p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md hover:border-[#1f8898]/30 transition-all duration-300 relative overflow-hidden">
                            
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                        doc.category === 'LEGAL' ? 'bg-amber-50 border-amber-100' :
                                        doc.category === 'INSPECTION' ? 'bg-blue-50 border-blue-100' :
                                        'bg-[#ebf3f5] border-[#1f8898]/20'
                                    }`}>
                                        {getIcon(doc.category)}
                                    </div>

                                    {doc.type === 'E-SIGN' ? (
                                        <>
                                            {doc.status === 'PENDING_SIGNATURE' && (
                                                <span className="text-rose-600 border border-rose-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                                    <AlertCircle className="w-3 h-3" /> Action Needed
                                                </span>
                                            )}
                                            {doc.status === 'PENDING_APPROVAL' && (
                                                <span className="text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Submitted
                                                </span>
                                            )}
                                            {doc.status === 'APPROVED' && (
                                                <span className="text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Signed
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        doc.is_signed && (
                                            <span className="text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> Signed
                                            </span>
                                        )
                                    )}
                                </div>
                                
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{doc.category}</p>
                                <h3 className="text-xl font-black text-gray-900 leading-tight tracking-tight mb-2">
                                    {doc.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mb-6">
                                    {doc.description}
                                </p>
                            </div>

                            <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Added</span>
                                    <span className="text-xs font-black text-gray-900">
                                        {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                {doc.type === 'E-SIGN' ? (
                                    doc.status === 'PENDING_SIGNATURE' ? (
                                        <button 
                                            onClick={() => { 
                                                setSelectedDoc(doc); 
                                                setIsDocModalOpen(true); 
                                                setSignature(''); 
                                                setHasExceptions(false);
                                                setInspectionNotes('');
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 border border-[#1f8898] text-[#1f8898] hover:bg-[#1f8898] hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            <PenTool className="w-4 h-4" /> Read & Sign
                                        </button>
                                    ) : doc.status === 'APPROVED' ? (
                                        <button 
                                            onClick={() => handleDownloadPDF(doc)}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-black transition-all active:scale-95"
                                        >
                                            <Download className="w-4 h-4" /> Download PDF
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { setSelectedDoc(doc); setIsDocModalOpen(true); }}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                                        >
                                            <FileText className="w-4 h-4" /> Read Doc
                                        </button>
                                    )
                                ) : doc.type === 'CUSTOM_PDF' ? (
                                    <a 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        <Download className="w-4 h-4" /> Download Lease
                                    </a>
                                ) : (
                                    <button 
                                        onClick={() => { setSelectedDoc(doc); setIsDocModalOpen(true); }}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-black transition-all active:scale-95"
                                    >
                                        <Download className="w-4 h-4" /> {doc.size}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </main>

            {/* --- SECURE E-SIGNATURE / READ MODAL --- */}
            {isDocModalOpen && selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsDocModalOpen(false)}></div>
                    
                    <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">{selectedDoc.title}</h3>
                                    <p className="text-xs font-medium text-gray-500">Please review the document carefully.</p>
                                </div>
                            </div>
                            <button onClick={() => !isSubmitting && setIsDocModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Document Content (Scrollable) */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/30">
                            <div 
                                className="prose prose-sm md:prose-base prose-headings:text-gray-900 prose-p:text-gray-600 max-w-none bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm"
                                dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                            />
                        </div>

                        {/* Footer Action Area */}
                        <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                            {selectedDoc.status === 'PENDING_SIGNATURE' ? (
                                <form onSubmit={handleSignDocument}>
                                    
                                    {/* INSPECTION EXCEPTIONS LOGIC */}
                                    {selectedDoc.category === 'INSPECTION' && (
                                        <div className="mb-5">
                                            <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors mb-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="mt-1 w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-600"
                                                    checked={hasExceptions}
                                                    onChange={(e) => {
                                                        setHasExceptions(e.target.checked);
                                                        if (!e.target.checked) setInspectionNotes('');
                                                    }}
                                                />
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-900">I have exceptions or disagree with some items</span>
                                                    <span className="block text-xs text-gray-500 mt-0.5">Check this box if the unit condition does not match the report above.</span>
                                                </div>
                                            </label>

                                            {hasExceptions && (
                                                <div className="animate-in slide-in-from-top-2">
                                                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">List Your Exceptions</label>
                                                    <textarea 
                                                        rows={3} 
                                                        required
                                                        placeholder="e.g. Scuff marks on living room wall, kitchen faucet drips..."
                                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 text-sm font-medium text-gray-900 mb-3"
                                                        value={inspectionNotes}
                                                        onChange={(e) => setInspectionNotes(e.target.value)}
                                                    ></textarea>
                                                    
                                                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-2 items-start mb-2">
                                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                        <p className="text-xs text-amber-800 font-medium">
                                                            <strong className="font-black">Best Practice:</strong> Recording exceptions here logs them for your move-out record. To request immediate repairs, please submit a maintenance ticket via the <strong className="font-black">Service Hub</strong> after signing.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-2">
                                            <PenTool className="w-3.5 h-3.5" /> Electronic Signature
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3 ml-1">By typing your full name below, you legally agree to the terms outlined in this document.</p>
                                        <input 
                                            type="text" required placeholder={`e.g. ${profile?.first_name} ${profile?.last_name}`}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900 font-serif" 
                                            value={signature} onChange={(e) => setSignature(e.target.value)} 
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setIsDocModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors">Decline / Cancel</button>
                                        <button type="submit" disabled={isSubmitting || !signature.trim() || (hasExceptions && !inspectionNotes.trim())} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Submit Signature
                                        </button>
                                    </div>
                                </form>
                            ) : selectedDoc.status === 'PENDING_APPROVAL' ? (
                                <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col items-center">
                                    <Clock className="w-8 h-8 text-blue-500 mb-2" />
                                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Awaiting Landlord</h4>
                                    <p className="text-xs font-medium text-blue-700 mt-1">You have submitted your signature. Waiting for landlord approval.</p>
                                </div>
                            ) : (
                                <div className="flex justify-end gap-3">
                                    {selectedDoc.type === 'STANDARD_DOC' && (
                                        <button type="button" onClick={() => handleDownloadPDF(selectedDoc)} className="px-6 py-3 text-sm font-bold text-white bg-[#1f8898] hover:bg-[#156e7b] rounded-xl transition-colors flex items-center gap-2">
                                            <Download className="w-4 h-4" /> Download Document
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setIsDocModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Close</button>
                                </div>
                            )}
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}