// apps/web/app/super-admin/templates/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
    Loader2, FileText, Save, FileSignature, 
    LayoutTemplate, Eye, PenTool, FileSearch, 
    CheckCircle2, History, Copy, Check, Sparkles
} from 'lucide-react';

// @ts-expect-error: TS strict mode blocks this, but Next.js bundles it perfectly
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="p-8 flex justify-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

const DEFAULT_TEMPLATES = [
    { type: 'STANDARD_LEASE', name: 'Standard Lease Agreement', desc: 'The default legal binding contract for residential units.', icon: <FileSignature className="w-5 h-5 text-indigo-600" /> },
    { type: 'BUILDING_RULES', name: 'Community & Building Rules', desc: 'Code of conduct, noise policies, and shared space rules.', icon: <FileSearch className="w-5 h-5 text-amber-600" /> },
    { type: 'INSPECTION_REPORT', name: 'Move-in Inspection Form', desc: 'Condition report template signed during key handover.', icon: <FileText className="w-5 h-5 text-emerald-600" /> }
];

const DYNAMIC_VARIABLES = [
    { tag: '{{TENANT_NAME}}', desc: 'Full name of the tenant' },
    { tag: '{{LANDLORD_COMPANY}}', desc: 'Property management company name' },
    { tag: '{{UNIT_NUMBER}}', desc: 'Assigned unit (e.g., A1)' },
    { tag: '{{RENT_AMOUNT}}', desc: 'Monthly rent cost' },
    { tag: '{{LEASE_START_DATE}}', desc: 'Start date of the contract' },
    { tag: '{{LEASE_END_DATE}}', desc: 'End date of the contract' },
];

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
    ],
};

// --- DYNAMIC PREVIEW DATA ---
const PREVIEW_DATA = {
    tenantName: '{{TENANT_NAME}}',
    landlordCompany: '{{LANDLORD_COMPANY}}',
    unitNumber: '{{UNIT_NUMBER}}',
    rentAmount: '{{RENT_AMOUNT}}',
    startDate: '{{LEASE_START_DATE}}',
    endDate: '{{LEASE_END_DATE}}',
    currentDate: new Date().toLocaleDateString()
};

// --- THE PREMIUM MOGIRENTOS HTML TEMPLATE ---
const PREMIUM_LEASE_HTML = `
<h2 style="color: #1f8898; text-align: center; font-size: 18px; font-weight: 900; border-bottom: 2px solid #1f8898; padding-bottom: 10px; margin-bottom: 20px; text-transform: uppercase;">
  Standard Residential Lease Agreement
</h2>
<p>This Lease Agreement is officially entered into on <strong>{{LEASE_START_DATE}}</strong> by and between:</p>
<p><strong>LANDLORD:</strong> {{LANDLORD_COMPANY}}<br/><strong>TENANT:</strong> {{TENANT_NAME}}</p>

<h3 style="color: #1f8898; font-size: 15px; font-weight: 800; margin-top: 30px; text-transform: uppercase;">1. Premises & Duration</h3>
<p>The Landlord agrees to rent the premises located at <strong>{{LANDLORD_COMPANY}} - Unit {{UNIT_NUMBER}}</strong> to the Tenant.</p>
<p>The term of this lease shall commence on <strong>{{LEASE_START_DATE}}</strong> and terminate on <strong>{{LEASE_END_DATE}}</strong>.</p>

<h3 style="color: #1f8898; font-size: 15px; font-weight: 800; margin-top: 30px; text-transform: uppercase;">2. Rent Details</h3>
<p>The Tenant agrees to pay a monthly rent of <strong>KSH {{RENT_AMOUNT}}</strong>, payable strictly on or before the 5th day of every calendar month via the official MogiRentOS payment portal.</p>

<h3 style="color: #1f8898; font-size: 15px; font-weight: 800; margin-top: 30px; text-transform: uppercase;">3. Use of Premises & Maintenance</h3>
<ul>
  <li>The premises shall be used exclusively for residential purposes by the Tenant and authorized occupants.</li>
  <li>The Tenant shall maintain the premises in a clean, sanitary, and good condition. All damages caused by the Tenant's negligence will be repaired at the Tenant's expense.</li>
  <li>The Landlord will be responsible for structural and major electrical/plumbing repairs not caused by the Tenant.</li>
</ul>

<h3 style="color: #1f8898; font-size: 15px; font-weight: 800; margin-top: 30px; text-transform: uppercase;">4. Default & Termination</h3>
<p>If the Tenant fails to pay rent within 10 days of the due date, the Landlord reserves the right to terminate this agreement, initiate eviction proceedings, and claim outstanding arrears.</p>
<p>Either party may terminate this agreement early by providing a formal <strong>30-day written notice</strong> via the system.</p>

<div style="margin-top: 30px; padding: 15px; background-color: #f8fafb; border-left: 4px solid #1f8898; font-size: 12px; color: #4b5563;">
  By electronically signing this document via MogiRentOS, both parties acknowledge and agree to be bound by the terms and conditions set forth above.
</div>
`;

export default function TemplateLibraryPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeTemplateType, setActiveTemplateType] = useState('STANDARD_LEASE');
    const [editorContent, setEditorContent] = useState('');
    const [viewMode, setViewMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
    const [isSaving, setIsSaving] = useState(false);
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/templates`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
                
                const active = data.find((t: any) => t.type === activeTemplateType);
                if (active) setEditorContent(active.content);
                else setEditorContent(''); 
            }
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    useEffect(() => {
        const active = templates.find((t: any) => t.type === activeTemplateType);
        if (active) setEditorContent(active.content);
        else setEditorContent('');
        setViewMode('EDIT');
    }, [activeTemplateType, templates]);

    const handleSaveTemplate = async () => {
        setIsSaving(true);
        const templateDef = DEFAULT_TEMPLATES.find(t => t.type === activeTemplateType);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/templates`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({ name: templateDef?.name, type: activeTemplateType, content: editorContent })
            });
            if (res.ok) {
                alert('Global template saved successfully!');
                fetchTemplates();
            } else throw new Error('Failed to save template');
        } catch (err) { alert('Error saving template'); }
        finally { setIsSaving(false); }
    };

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const generatePreviewContent = () => {
        return editorContent; // Returning raw tags
    };

    if (isLoading && templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafb]">
                <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading WYSIWYG Editor...</p>
            </div>
        );
    }

    const activeTemplateDetails = DEFAULT_TEMPLATES.find(t => t.type === activeTemplateType);
    const savedTemplateMeta = templates.find((t: any) => t.type === activeTemplateType);

    return (
        <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
            
            <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-20 relative overflow-hidden shadow-inner">
                <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                            <LayoutTemplate className="w-3.5 h-3.5" /> Platform Documents
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
                            Global Template Library
                        </h1>
                        <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Draft and manage the default legal documents, leases, and rules that landlords will use across the platform.
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
                
                <div className="flex flex-col lg:flex-row gap-6 min-h-[850px]">
                    
                    {/* LEFT COLUMN: Library Selection & Variables */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-6">
                        
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Master Documents</h3>
                            </div>
                            <div className="p-3 space-y-2">
                                {DEFAULT_TEMPLATES.map((tmpl) => (
                                    <button 
                                        key={tmpl.type}
                                        onClick={() => setActiveTemplateType(tmpl.type)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all group flex items-start gap-4 ${
                                            activeTemplateType === tmpl.type 
                                            ? 'bg-white border-[#1f8898] shadow-md ring-1 ring-[#1f8898]/10' 
                                            : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTemplateType === tmpl.type ? 'bg-[#ebf3f5]' : 'bg-gray-100'}`}>
                                            {tmpl.icon}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm transition-colors ${activeTemplateType === tmpl.type ? 'text-[#1f8898]' : 'text-gray-900'}`}>
                                                {tmpl.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-snug">{tmpl.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Dynamic Data Tags</h3>
                                <p className="text-xs font-medium text-gray-500 mt-1">Click a tag to copy, then paste it into the editor.</p>
                            </div>
                            <div className="p-3 space-y-2">
                                {DYNAMIC_VARIABLES.map(v => (
                                    <button 
                                        key={v.tag} 
                                        onClick={() => handleCopyTag(v.tag)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                                        title="Click to copy"
                                    >
                                        <div className="text-left">
                                            <code className="text-[11px] font-black text-[#1f8898] bg-[#1f8898]/10 px-2 py-1 rounded">{v.tag}</code>
                                            <p className="text-xs text-gray-500 mt-1.5">{v.desc}</p>
                                        </div>
                                        <div className="shrink-0 text-gray-400 group-hover:text-[#1f8898]">
                                            {copiedTag === v.tag ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: True WYSIWYG Editor */}
                    <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 delay-100">
                        
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">{activeTemplateDetails?.name}</h3>
                                    {savedTemplateMeta && <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <History className="w-3 h-3" /> 
                                    {savedTemplateMeta ? `Last updated ${new Date(savedTemplateMeta.updated_at).toLocaleString()}` : 'System Default (Unmodified)'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                {/* Load Premium Layout Quick Action */}
                                {editorContent === '' && viewMode === 'EDIT' && (
                                    <button 
                                        onClick={() => setEditorContent(PREMIUM_LEASE_HTML)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-all hover:shadow-md active:scale-95"
                                    >
                                        <Sparkles className="w-4 h-4" /> Load Premium Layout
                                    </button>
                                )}

                                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm shrink-0 w-full sm:w-auto">
                                    <button onClick={() => setViewMode('EDIT')} className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'EDIT' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-500 hover:text-gray-900'}`}>
                                        <PenTool className="w-4 h-4" /> Visual Editor
                                    </button>
                                    <button onClick={() => setViewMode('PREVIEW')} className={`flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'PREVIEW' ? 'bg-[#1f8898] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                                        <Eye className="w-4 h-4" /> A4 Preview
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#f8fafb] relative overflow-y-auto">
                            {viewMode === 'EDIT' ? (
                                <div className="absolute inset-0 w-full h-full bg-white pb-12">
                                    <div className="h-full [&_.quill]:h-full [&_.ql-container]:border-none [&_.ql-container]:text-sm [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50">
                                        <ReactQuill 
                                            theme="snow" 
                                            value={editorContent} 
                                            onChange={setEditorContent} 
                                            modules={quillModules}
                                            placeholder="Write your document here. Click 'Load Premium Layout' above to start with a beautiful design..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 w-full h-full py-8 px-4 overflow-y-auto bg-slate-200">
                                    {/* --- RESPONSIVE A4 PREVIEW ENGINE --- */}
                                    <div className="max-w-[210mm] w-full min-h-[297mm] mx-auto bg-white shadow-2xl flex flex-col overflow-hidden">
                                        
                                        {/* Dynamic Header */}
                                        <div className="bg-[#113a3f] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-12 py-8 sm:py-10 shrink-0 gap-4 sm:gap-0">
                                            <div className="w-full sm:w-auto overflow-hidden">
                                                <h1 className="text-xl sm:text-3xl font-black mb-1 tracking-tight break-words">{PREVIEW_DATA.landlordCompany}</h1>
                                                <p className="text-xs sm:text-sm text-slate-300 font-medium">Automated Property Management</p>
                                            </div>
                                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-left sm:text-right shrink-0">
                                                {activeTemplateType === 'STANDARD_LEASE' ? 'OFFICIAL LEASE AGREEMENT' : 
                                                 activeTemplateType === 'INSPECTION_REPORT' ? 'MOVE-IN INSPECTION REPORT' : 
                                                 'OFFICIAL DOCUMENT'}
                                            </h2>
                                        </div>

                                        <div className="p-6 sm:p-12 flex-grow text-gray-700 text-[13px] sm:text-[14px] leading-loose">
                                            <div className="prose prose-sm sm:prose-base prose-slate max-w-none break-words" 
                                                 dangerouslySetInnerHTML={{ __html: generatePreviewContent() || '<p class="text-gray-400 italic">No content to preview.</p>' }} 
                                            />
                                            
                                            {/* BLANK TEMPLATE SIGNATURES WITH CURRENT DATES */}
                                            <div className="mt-12 sm:mt-20 flex flex-col sm:flex-row justify-between gap-8 sm:gap-10">
                                                <div className="flex-1 w-full">
                                                    <div className="border-b-2 border-gray-900 h-10 flex items-end pb-1 w-full"></div>
                                                    <div className="text-[11px] sm:text-xs font-black text-gray-600 uppercase tracking-widest mt-2 break-words">Tenant Signature ({"{{TENANT_NAME}}"})</div>
                                                    <div className="text-[10px] text-gray-500 font-bold mt-1">Date: {PREVIEW_DATA.currentDate}</div>
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <div className="border-b-2 border-gray-900 h-10 flex items-end pb-1 w-full"></div>
                                                    <div className="text-[11px] sm:text-xs font-black text-gray-600 uppercase tracking-widest mt-2">Landlord / Manager Signature</div>
                                                    <div className="text-[10px] text-gray-500 font-bold mt-1">Date: {PREVIEW_DATA.currentDate}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Footer */}
                                        <div className="bg-gray-100 text-center px-6 sm:px-12 py-6 shrink-0 mt-auto border-t border-gray-200">
                                            <p className="text-[9px] sm:text-[10px] text-gray-500 mb-1">This is a legally binding, computer-generated e-document.</p>
                                            <p className="text-[9px] sm:text-[10px] text-gray-500 mb-1">Generated via MogiRentOS on {new Date().toLocaleString()}</p>
                                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-600 mt-1">Powered by Mogitech Global Ltd</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-white flex justify-end shrink-0 z-10">
                            <button 
                                onClick={handleSaveTemplate} 
                                disabled={isSaving || !editorContent} 
                                className="flex items-center gap-2 px-8 py-3.5 bg-[#1f8898] text-white rounded-xl text-sm font-black hover:bg-[#1a7684] transition-all shadow-lg shadow-[#1f8898]/20 active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                                Deploy Global Template
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}