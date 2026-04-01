// apps/web/app/dashboard/leases/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSignature, Home, Calendar, CheckCircle2,
  XCircle, Clock, Search, Edit, Trash2, X,
  Loader2, AlertCircle, CalendarDays,
  LogOut, ShieldAlert, Crown, Download, RefreshCw, FileText,
  PenTool, ExternalLink, Plus, UploadCloud, User, FolderOpen, FileImage
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

export default function MasterLeasesPage() {
  const router = useRouter();
  const { profile } = useUserStore();

  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // --- Filtering States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modals State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [approveDocType, setApproveDocType] = useState<'LEASE' | 'RULES' | 'INSPECTION'>('LEASE'); // ADDED

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', lease_start: '', lease_end: ''
  });

  const [createForm, setCreateForm] = useState({
    unitId: '', first_name: '', last_name: '', email: '', phone: '',
    lease_start: '', lease_end: '', lease_type: 'STANDARD', lease_file_url: ''
  });

  const [approveSignature, setApproveSignature] = useState('');

  const currentPlan = profile?.subscription_status || profile?.landlord?.subscription_status || 'FREE';
  const isPro = currentPlan === 'PRO' || currentPlan === 'PREMIUM';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) return router.push('/login');
      if (!res.ok) throw new Error('Failed to load lease data.');

      setTenants(await res.json());
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (e) {
      console.error('Failed to load properties for unit selection');
    }
  };

  useEffect(() => {
    fetchData();
    fetchProperties();
  }, [router]);

  const vacantUnits = properties.flatMap(p => (p.units || []).map((u: any) => ({ ...u, property: p }))).filter(u => u.status === 'VACANT');

  // --- LEASE CREATION (ONBOARDING) ---
  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.unitId) {
      setStatusMsg({ type: 'error', text: 'Please select a unit to assign to the tenant.' });
      return;
    }
    if (createForm.lease_type === 'CUSTOM' && !createForm.lease_file_url) {
      setStatusMsg({ type: 'error', text: 'Please upload the custom PDF document before proceeding.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/onboard/${createForm.unitId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate lease contract.');

      setStatusMsg({ type: 'success', text: 'Tenant onboarded and lease contract generated successfully!' });
      setIsCreateModalOpen(false);
      setCreateForm({
        unitId: '', first_name: '', last_name: '', email: '', phone: '',
        lease_start: '', lease_end: '', lease_type: 'STANDARD', lease_file_url: ''
      });
      await fetchData();
      await fetchProperties();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Tenant Name', 'Property', 'Unit', 'Lease Start', 'Lease End', 'Status', 'Document Status'];
    const csvRows = filteredLeases.map(t => {
      return [
        `"${t.first_name} ${t.last_name}"`,
        `"${t.unit?.property?.name || 'N/A'}"`,
        `"${t.unit?.unit_number || 'N/A'}"`,
        `"${new Date(t.lease_start).toLocaleDateString()}"`,
        `"${new Date(t.lease_end).toLocaleDateString()}"`,
        `"${t.is_active ? 'Active' : 'Terminated'}"`,
        `"${t.lease_document?.status || 'N/A'}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lease_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handle1ClickRenew = async (tenant: any) => {
    if (!isPro) return router.push('/dashboard/settings/billing');

    const currentEndDate = new Date(tenant.lease_end);
    const newEndDate = new Date(currentEndDate.setFullYear(currentEndDate.getFullYear() + 1));

    setStatusMsg({ type: 'info', text: 'Processing renewal...' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...tenant,
          lease_start: tenant.lease_start,
          lease_end: newEndDate.toISOString()
        })
      });

      if (!res.ok) throw new Error('Failed to auto-renew lease.');

      setStatusMsg({ type: 'success', text: `Lease successfully renewed for 1 year until ${newEndDate.toLocaleDateString()}!` });
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // --- DYNAMIC PDF LEASE GENERATOR (SUPPORTING CUSTOM UPLOADS & MULTIPLE DOCS) ---
  const handleDownloadContract = (tenant: any, docType: 'LEASE' | 'RULES' | 'INSPECTION') => {
    if (!isPro) return router.push('/dashboard/settings/billing');

    if (docType === 'LEASE' && tenant.lease_document?.type === 'CUSTOM' && tenant.lease_document?.file_url) {
      window.open(tenant.lease_document.file_url, '_blank');
      return;
    }

    setStatusMsg({ type: 'info', text: `Generating ${docType} PDF...` });

    const companyName = profile?.company_name || profile?.landlord?.company_name || 'MogiRentOS Management';
    const tenantName = `${tenant.first_name} ${tenant.last_name}`;

    let docTitle = '';
    let docContent = '';
    let tenantSig = 'Pending Signature';
    let landlordSig = 'Pending Approval';
    let tenantDate = '';
    let landlordDate = '';

    if (docType === 'LEASE') {
      docTitle = 'OFFICIAL LEASE AGREEMENT';
      docContent = tenant.lease_document?.content || `<p>Lease Agreement Details for ${tenantName}.</p>`;
      tenantSig = tenant.lease_document?.tenant_signature || 'Pending Signature';
      landlordSig = tenant.lease_document?.landlord_signature || 'Pending Approval';
      tenantDate = tenant.lease_document?.signed_at ? new Date(tenant.lease_document.signed_at).toLocaleDateString() : '';
      landlordDate = tenant.lease_document?.approved_at ? new Date(tenant.lease_document.approved_at).toLocaleDateString() : '';
    } else if (docType === 'RULES') {
      docTitle = 'BUILDING RULES & REGULATIONS';
      tenantSig = tenant.rules_signature || 'Pending Signature';
      landlordSig = tenant.rules_landlord_signature || 'Pending Approval';
      tenantDate = tenant.rules_signed_at ? new Date(tenant.rules_signed_at).toLocaleDateString() : '';
      landlordDate = tenant.rules_approved_at ? new Date(tenant.rules_approved_at).toLocaleDateString() : '';
      docContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
              <h2 style="color: #111827; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">BUILDING RULES & POLICIES</h2>
              <h4 style="color: #1f8898; margin-top: 20px;">1. General Conduct & Noise</h4>
              <p>Tenants shall not make or allow any disturbing noises in the unit or on the premises. Quiet hours are strictly enforced between <strong>10:00 PM and 7:00 AM</strong> daily.</p>
              <h4 style="color: #1f8898; margin-top: 20px;">2. Refuse & Garbage</h4>
              <p>All garbage must be properly bagged and disposed of in the designated community bins. Do not leave trash bags in hallways or common areas.</p>
              <h4 style="color: #1f8898; margin-top: 20px;">3. Alterations & Decor</h4>
              <p>No structural alterations, painting, or heavy drilling is permitted without prior written consent from management.</p>
              <h4 style="color: #1f8898; margin-top: 20px;">4. Common Areas</h4>
              <p>Corridors, walkways, and stairwells must remain clear of personal belongings, shoes, and bicycles at all times for fire safety.</p>
          </div>
        `;
    } else if (docType === 'INSPECTION') {
      docTitle = 'MOVE-IN INSPECTION REPORT';
      tenantSig = tenant.inspection_signature || 'Pending Signature';
      landlordSig = tenant.inspection_landlord_signature || 'Pending Approval';
      tenantDate = tenant.inspection_signed_at ? new Date(tenant.inspection_signed_at).toLocaleDateString() : '';
      landlordDate = tenant.inspection_approved_at ? new Date(tenant.inspection_approved_at).toLocaleDateString() : '';

      // NEW: Render the tenant's notes if they exist
      const exceptionsHtml = tenant.inspection_notes ? `
            <div style="margin-top: 25px; padding: 15px; background-color: #fffbeb; border-left: 4px solid #f59e0b;">
                <h4 style="color: #b45309; margin: 0 0 5px 0; font-size: 14px;">Tenant Exceptions / Notes:</h4>
                <p style="margin: 0; font-size: 13px; color: #92400e; font-style: italic;">"${tenant.inspection_notes}"</p>
            </div>
        ` : '';

      docContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151;">
              <h2 style="color: #111827; font-size: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">MOVE-IN INSPECTION REPORT</h2>
              <p><strong>Unit:</strong> ${tenant.unit?.unit_number} &nbsp; | &nbsp; <strong>Date Inspected:</strong> ${new Date(tenant.lease_start).toLocaleDateString()}</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left;">
                  <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 10px;">Area / Item</th>
                      <th style="padding: 10px;">Condition</th>
                      <th style="padding: 10px;">Notes</th>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;">Living Area Walls & Floors</td>
                      <td style="padding: 10px; color: #047857; font-weight: bold;">Good / Clean</td>
                      <td style="padding: 10px;">Freshly painted</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;">Kitchen Fixtures & Plumbing</td>
                      <td style="padding: 10px; color: #047857; font-weight: bold;">Working</td>
                      <td style="padding: 10px;">No leaks detected</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;">Bathroom Tiles & Fittings</td>
                      <td style="padding: 10px; color: #047857; font-weight: bold;">Good</td>
                      <td style="padding: 10px;">Standard wear</td>
                  </tr>
              </table>
              ${exceptionsHtml}
              <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">* This serves as the baseline condition for assessing any damages upon move-out.</p>
          </div>
        `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} - ${tenantName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
            body { font-family: 'Inter', sans-serif; color: #111827; padding: 0; margin: 0; background: #ffffff; }
            .a4-container { max-width: 800px; margin: 0 auto; background: #ffffff; position: relative; min-height: 100vh; display: flex; flex-direction: column; }
            
            /* DARK TEAL HEADER EXACTLY LIKE SCREENSHOT */
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
              ${docContent}
              
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

  const openDocsModal = (tenant: any) => {
    setSelectedLease(tenant);
    setIsDocsModalOpen(true);
  };

  const openApproveModal = (tenant: any, docType: 'LEASE' | 'RULES' | 'INSPECTION') => {
    setSelectedLease(tenant);
    setApproveDocType(docType);
    setApproveSignature('');
    setIsApproveModalOpen(true);
  };

  const handleApproveLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      // Call the updated universal endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedLease.id}/approve-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ signature: approveSignature, docType: approveDocType })
      });

      if (!res.ok) throw new Error('Failed to approve document.');

      setStatusMsg({ type: 'success', text: `${approveDocType} officially counter-signed and fully approved!` });
      setIsApproveModalOpen(false);
      setIsDocsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- STANDARD ACTIONS ---

  const openEditModal = (tenant: any) => {
    setSelectedLease(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone,
      lease_start: tenant.lease_start ? new Date(tenant.lease_start).toISOString().split('T')[0] : '',
      lease_end: tenant.lease_end ? new Date(tenant.lease_end).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditLease = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedLease.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update lease agreements.');

      setStatusMsg({ type: 'success', text: `Lease dates updated successfully!` });
      setIsEditModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const openTerminateModal = (tenant: any) => {
    setSelectedLease(tenant);
    setIsTerminateModalOpen(true);
  };

  const handleTerminateLease = async () => {
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${selectedLease.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Failed to terminate lease.');

      setStatusMsg({ type: 'success', text: `Lease terminated successfully. Unit is now vacant.` });
      setIsTerminateModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  // --- Data Processing ---
  const now = new Date();
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const isExpiringSoon = (endDateStr: string, isActive: boolean) => {
    if (!isActive) return false;
    const end = new Date(endDateStr);
    return end <= sixtyDaysFromNow && end >= now;
  };

  const totalLeases = tenants.length;
  const activeCount = tenants.filter(t => t.is_active).length;
  const expiringCount = tenants.filter(t => isExpiringSoon(t.lease_end, t.is_active)).length;
  const terminatedCount = tenants.filter(t => !t.is_active).length;

  const filteredLeases = tenants.filter(tenant => {
    const searchString = `${tenant.first_name} ${tenant.last_name} ${tenant.unit?.property?.name} ${tenant.unit?.unit_number}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const expiring = isExpiringSoon(tenant.lease_end, tenant.is_active);

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && tenant.is_active) ||
      (filterStatus === 'EXPIRING' && expiring) ||
      (filterStatus === 'TERMINATED' && !tenant.is_active);

    return matchesSearch && matchesStatus;
  });

  const getFilterPillClass = (status: string) => {
    const isActive = filterStatus === status;
    return `px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-[#1f8898] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
      }`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">

      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-8 pb-14 md:pt-10 md:pb-16 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 border border-white/20 backdrop-blur-sm">
              <FileSignature className="w-3.5 h-3.5" /> Contracts & Compliance
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] tracking-tight mb-2">
              Lease Management
            </h1>
            <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              Monitor contract durations, digitally counter-sign e-documents, and safely manage lease terminations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0 w-full md:w-auto">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto bg-[#ffffff] hover:bg-gray-50 text-[#1f8898] px-6 py-2.5 rounded-xl font-black text-sm shadow-xl shadow-black/10 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Lease
            </button>
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl font-black text-sm backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Ledger
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 md:-mt-10 relative z-20">

        {statusMsg && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4 border
            ${statusMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              statusMsg.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-red-50 border-red-200 text-red-800'}
          `}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> :
              statusMsg.type === 'info' ? <Loader2 className="w-5 h-5 shrink-0 animate-spin" /> :
                <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="font-bold text-sm">{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-100 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-200">
                <FileSignature className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-right leading-tight">Total<br />Contracts</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{totalLeases}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">All historical records</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right leading-tight">Active<br />Leases</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{activeCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Currently occupied units</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 text-right leading-tight">Expiring<br />Soon</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{expiringCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ending within 60 days</p>
            </div>
          </div>

          <div className="bg-[#ffffff] p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 text-right leading-tight">Past<br />Leases</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate">{terminatedCount}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Moved out / Terminated</p>
            </div>
          </div>

        </div>

        <div className="bg-[#ffffff] rounded-3xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden mb-12">

          <div className="p-5 border-b border-gray-100 bg-[#f8fafb]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setFilterStatus('ALL')} className={getFilterPillClass('ALL')}>All Leases</button>
              <button onClick={() => setFilterStatus('ACTIVE')} className={getFilterPillClass('ACTIVE')}>Active</button>
              <button onClick={() => setFilterStatus('EXPIRING')} className={getFilterPillClass('EXPIRING')}>Expiring Soon</button>
              <button onClick={() => setFilterStatus('TERMINATED')} className={getFilterPillClass('TERMINATED')}>Terminated</button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text" placeholder="Search tenant or property..."
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-[#1f8898] focus:ring-2 focus:ring-[#1f8898]/20 transition-all bg-[#ffffff]"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#1f8898] gap-4">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Loading Contracts...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#ffffff] text-[10px] uppercase tracking-widest text-gray-400 font-black">
                    <th className="px-6 py-4 pl-8">Contract Party</th>
                    <th className="px-6 py-4">Unit Assigned</th>
                    <th className="px-6 py-4">Lease Duration</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-[#ffffff]">
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1f8898]">
                          <FileSignature className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No leases found</h3>
                        <p className="text-sm text-gray-500 font-medium">No contracts match your current filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeases.map((tenant) => {
                      const expiring = isExpiringSoon(tenant.lease_end, tenant.is_active);

                      return (
                        <tr key={tenant.id} className={`hover:bg-gray-50/50 transition duration-150 group ${!tenant.is_active ? 'opacity-70' : ''}`}>
                          <td className="px-6 py-4 pl-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center font-black shadow-sm border border-[#1f8898]/10 shrink-0">
                                <FileSignature className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-[#1f8898] transition-colors">{tenant.first_name} {tenant.last_name}</p>
                                <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-0.5">{tenant.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                              <Home className="w-4 h-4 text-gray-400 group-hover:text-[#1f8898] transition-colors" />
                              {tenant.unit?.property?.name || 'N/A'}
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold tracking-wide mt-1 uppercase">
                              Unit {tenant.unit?.unit_number || 'N/A'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-bold flex items-center gap-1.5 mb-0.5">
                              <CalendarDays className="w-3.5 h-3.5 text-[#1f8898]" />
                              {new Date(tenant.lease_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5 pl-5">
                              <span className="text-gray-300">to</span> {new Date(tenant.lease_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {!tenant.is_active ? (
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1.5 w-max">
                                  <XCircle className="w-3 h-3" /> Terminated
                                </span>
                              ) : expiring ? (
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 w-max">
                                  <Clock className="w-3 h-3" /> Expiring Soon
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 w-max">
                                  <CheckCircle2 className="w-3 h-3" /> Active Lease
                                </span>
                              )}

                              {/* E-DOCUMENT STATUS BADGE */}
                              {tenant.lease_document && tenant.is_active && (
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${tenant.lease_document.status === 'APPROVED' ? 'text-emerald-500' :
                                    tenant.lease_document.status === 'PENDING_APPROVAL' ? 'text-blue-500' :
                                      'text-amber-500'
                                  }`}>
                                  Doc: {tenant.lease_document.status.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 pr-8 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {tenant.is_active && (
                                <>
                                  {/* PENDING ACTIONS ALERTS */}
                                  {tenant.lease_document?.status === 'PENDING_SIGNATURE' && (
                                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest border border-amber-200 bg-amber-50 px-2 py-1.5 rounded-lg flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Awaiting Tenant
                                    </span>
                                  )}

                                  {/* STANDARD RENEW */}
                                  {(!tenant.lease_document || tenant.lease_document.status === 'APPROVED') && (
                                    <button
                                      onClick={() => handle1ClickRenew(tenant)}
                                      className={`p-2 border rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3 ${isPro
                                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-emerald-100'
                                          : 'bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'
                                        }`}
                                      title={isPro ? "Auto-Renew for 1 Year" : "Pro Feature: 1-Click Renewal"}
                                    >
                                      {!isPro && <Crown className="w-3 h-3 text-amber-400" />}
                                      <RefreshCw className="w-3.5 h-3.5" />
                                      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Renew</span>
                                    </button>
                                  )}

                                  {/* THE NEW DOCUMENTS CENTER BUTTON */}
                                  <button
                                    onClick={() => openDocsModal(tenant)}
                                    className="p-2 bg-[#ffffff] text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5 px-3"
                                    title="View Tenant Documents"
                                  >
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Docs</span>
                                  </button>

                                  <div className="w-px h-6 bg-gray-200 mx-1"></div>

                                  <button
                                    onClick={() => openEditModal(tenant)}
                                    className="p-2 bg-[#ffffff] text-gray-400 hover:text-[#1f8898] hover:bg-[#ebf3f5] border border-gray-200 hover:border-[#1f8898]/30 rounded-xl transition-all shadow-sm active:scale-95"
                                    title="Edit Dates manually"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openTerminateModal(tenant)}
                                    className="p-2 bg-[#ffffff] text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-95"
                                    title="Terminate Lease"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {!tenant.is_active && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Archived</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* --- TENANT DOCUMENTS CENTER MODAL --- */}
      {isDocsModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsDocsModalOpen(false)}></div>

          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">

            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Tenant Document Center</h3>
                  <p className="text-xs font-medium text-gray-500">For {selectedLease.first_name} {selectedLease.last_name}</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsDocsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* 1. Official Lease Agreement */}
              <div className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1f8898]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ebf3f5] text-[#1f8898] flex items-center justify-center shrink-0">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">Official Lease Agreement</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedLease.lease_document?.type === 'CUSTOM' ? 'Custom Uploaded PDF' : 'Standard System Lease'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${selectedLease.lease_document?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedLease.lease_document?.status === 'PENDING_APPROVAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {selectedLease.lease_document?.status?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedLease.lease_document?.status === 'PENDING_APPROVAL' && (
                    <button onClick={() => openApproveModal(selectedLease, 'LEASE')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95">
                      <PenTool className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {(selectedLease.lease_document?.status === 'APPROVED' || selectedLease.lease_document?.type === 'CUSTOM') && (
                    <button onClick={() => handleDownloadContract(selectedLease, 'LEASE')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Building Rules & Regulations */}
              <div className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1f8898]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 border border-gray-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">Building Rules & Regulations</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Standard Policy Document</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${selectedLease.rules_landlord_signature ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedLease.rules_signature ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {selectedLease.rules_landlord_signature ? 'APPROVED' : (selectedLease.rules_signature ? 'PENDING APPROVAL' : 'PENDING TENANT')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedLease.rules_signature && !selectedLease.rules_landlord_signature && (
                    <button onClick={() => openApproveModal(selectedLease, 'RULES')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95">
                      <PenTool className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {selectedLease.rules_landlord_signature && (
                    <button onClick={() => handleDownloadContract(selectedLease, 'RULES')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Move-in Inspection Report */}
              <div className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#1f8898]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileImage className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">Move-in Inspection Report</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Standard Condition Addendum</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${selectedLease.inspection_landlord_signature ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          selectedLease.inspection_signature ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {selectedLease.inspection_landlord_signature ? 'APPROVED' : (selectedLease.inspection_signature ? 'PENDING APPROVAL' : 'PENDING TENANT')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {selectedLease.inspection_signature && !selectedLease.inspection_landlord_signature && (
                    <button onClick={() => openApproveModal(selectedLease, 'INSPECTION')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95">
                      <PenTool className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {selectedLease.inspection_landlord_signature && (
                    <button onClick={() => handleDownloadContract(selectedLease, 'INSPECTION')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button type="button" onClick={() => setIsDocsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 shadow-sm">Close Document Center</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE NEW LEASE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsCreateModalOpen(false)}></div>

          <div className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Create New Lease</h3>
                  <p className="text-xs font-medium text-gray-500">Onboard a new tenant to a vacant unit.</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsCreateModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <form id="createLeaseForm" onSubmit={handleCreateLease} className="space-y-6">

                {/* 1. Property Selection */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1 flex items-center gap-2"><Home className="w-3.5 h-3.5" /> Assign Property & Unit</label>
                  <select
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50 font-bold text-gray-900 cursor-pointer"
                    value={createForm.unitId}
                    onChange={(e) => setCreateForm({ ...createForm, unitId: e.target.value })}
                  >
                    <option value="">Select a vacant unit...</option>
                    {vacantUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.property.name} - Unit {u.unit_number} (KSH {u.rent_amount})</option>
                    ))}
                  </select>
                  {vacantUnits.length === 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>No vacant units available. To manually override, paste the Unit ID below:</span>
                    </div>
                  )}
                  {vacantUnits.length === 0 && (
                    <input type="text" placeholder="Paste Unit ID here..." className="w-full mt-2 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 font-medium text-sm" value={createForm.unitId} onChange={(e) => setCreateForm({ ...createForm, unitId: e.target.value })} />
                  )}
                </div>

                <hr className="border-gray-100" />

                {/* 2. Tenant Info */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 ml-1 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Tenant Details</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" required placeholder="First Name" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 font-bold text-gray-900" value={createForm.first_name} onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })} />
                    <input type="text" required placeholder="Last Name" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 font-bold text-gray-900" value={createForm.last_name} onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })} />
                    <input type="email" required placeholder="Email Address" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 font-bold text-gray-900" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
                    <input type="tel" required placeholder="Phone Number" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-gray-50 font-bold text-gray-900" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 3. Dates */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 ml-1 flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" /> Lease Term</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold ml-1">Start Date</span>
                      <input type="date" required className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-white font-bold text-gray-900 cursor-pointer" value={createForm.lease_start} onChange={(e) => setCreateForm({ ...createForm, lease_start: e.target.value })} />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold ml-1">End Date</span>
                      <input type="date" required className="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] transition-all bg-white font-bold text-gray-900 cursor-pointer" value={createForm.lease_end} onChange={(e) => setCreateForm({ ...createForm, lease_end: e.target.value })} />
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* 4. Document Type */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3 ml-1 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Document Generation</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, lease_type: 'STANDARD', lease_file_url: '' })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${createForm.lease_type === 'STANDARD' ? 'border-[#1f8898] bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileSignature className="w-5 h-5" />
                        <span className="font-black text-sm">Standard Lease</span>
                      </div>
                      <p className="text-[10px] font-medium opacity-80 leading-tight mt-1.5">System generated rich-text PDF. Requires E-Signature from tenant.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, lease_type: 'CUSTOM' })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${createForm.lease_type === 'CUSTOM' ? 'border-[#1f8898] bg-[#ebf3f5] text-[#1f8898]' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud className="w-5 h-5" />
                        <span className="font-black text-sm">Custom Upload</span>
                      </div>
                      <p className="text-[10px] font-medium opacity-80 leading-tight mt-1.5">Upload your own previously signed PDF contract for storage.</p>
                    </button>
                  </div>

                  {createForm.lease_type === 'CUSTOM' && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input type="file" accept="application/pdf" required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            // Faking upload for demo purposes
                            setCreateForm({ ...createForm, lease_file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' });
                          }
                        }} />
                        <UploadCloud className="w-8 h-8 mx-auto text-[#1f8898] mb-2" />
                        <p className="text-sm font-bold text-gray-900">Click to attach custom PDF</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">(Simulated Upload Demo)</p>
                        {createForm.lease_file_url && (
                          <div className="mt-3 inline-flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Document Attached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 shadow-sm">Cancel</button>
              <button type="submit" form="createLeaseForm" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSubmitting ? 'Onboarding...' : 'Onboard Tenant & Create Lease'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Counter-Sign Modal --- */}
      {isApproveModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsApproveModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 p-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <PenTool className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Counter-Sign Lease</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Tenant <strong className="text-gray-900">{selectedLease.first_name} {selectedLease.last_name}</strong> has signed the lease agreement for <strong className="text-gray-900">Unit {selectedLease.unit?.unit_number}</strong>. Type your full name below to electronically counter-sign and officially approve this document.
            </p>

            <form onSubmit={handleApproveLease}>
              <div className="mb-6">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Your Full Name (E-Signature)</label>
                <div className="relative">
                  <PenTool className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text" required placeholder="e.g. Mogitech Global"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 font-bold text-gray-900"
                    value={approveSignature} onChange={(e) => setApproveSignature(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setIsApproveModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !approveSignature.trim()} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve & Sign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Edit Lease Modal --- */}
      {isEditModalOpen && selectedLease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsEditModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="bg-[#f8fafb] px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898]">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Modify Lease Dates</h3>
                  <p className="text-xs font-medium text-[#1f8898]">For {selectedLease.first_name} {selectedLease.last_name}</p>
                </div>
              </div>
              <button onClick={() => !isSubmitting && setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditLease} className="p-6 space-y-5">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                <p className="text-xs text-gray-500 font-medium mb-1">Assigned Property</p>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-[#1f8898]" /> {selectedLease.unit?.property?.name} - Unit {selectedLease.unit?.unit_number}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease Start</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_start} onChange={(e) => setFormData({ ...formData, lease_start: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Lease End</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" required className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-white font-bold text-gray-900 cursor-pointer" value={formData.lease_end} onChange={(e) => setFormData({ ...formData, lease_end: e.target.value })} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] rounded-xl transition-all shadow-lg shadow-[#1f8898]/20 disabled:opacity-50 flex items-center gap-2 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSubmitting ? 'Saving...' : 'Update Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Terminate Confirmation Modal --- */}
      {isTerminateModalOpen && selectedLease && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsTerminateModalOpen(false)}></div>

          <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 p-8">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Terminate Lease Contract?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to end the lease for <strong className="text-gray-900">{selectedLease.first_name} {selectedLease.last_name}</strong>? This will permanently archive the contract and free up unit <strong className="text-gray-900">{selectedLease.unit?.unit_number}</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsTerminateModalOpen(false)} className="flex-1 px-5 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleTerminateLease} disabled={isSubmitting} className="flex-[1.5] px-5 py-3 text-sm font-bold text-[#ffffff] bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-600/20 flex justify-center items-center gap-2 active:scale-95">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />} Terminate Lease
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}