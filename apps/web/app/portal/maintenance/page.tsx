// apps/web/app/portal/maintenance/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wrench, Plus, AlertCircle, Clock, 
  CheckCircle2, Loader2, X, HardHat,
  ShieldAlert, Activity, Hammer
} from 'lucide-react';

export default function TenantMaintenancePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    issue_type: 'PLUMBING',
    urgency: 'LOW',
    description: ''
  });

  const fetchRequests = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch('http://localhost:3000/api/v1/portal/maintenance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load maintenance history');
      setRequests(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch('http://localhost:3000/api/v1/portal/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit request');
      
      setIsModalOpen(false);
      setFormData({ issue_type: 'PLUMBING', urgency: 'LOW', description: '' });
      await fetchRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafb]">
            <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-[#1f8898]" />
                <div className="absolute inset-0 blur-xl bg-[#1f8898]/20 animate-pulse"></div>
            </div>
            <p className="text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">Loading Tickets...</p>
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
                <h2 className="text-gray-900 font-black text-2xl mb-2 tracking-tight">Connection Error</h2>
                <p className="text-gray-500 font-medium mb-8">{error}</p>
                <button onClick={() => window.location.reload()} className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95">
                    Retry Connection
                </button>
            </div>
        </div>
    );
  }

  // Calculate Metrics
  const activeRequests = requests.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED').length;
  const totalRequests = requests.length;

  const cardClass = "bg-[#ffffff] p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden";
  const inputStyle = "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:bg-white focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 transition-all bg-gray-50/50 text-gray-900 font-medium text-sm";

  return (
    <div className="min-h-screen bg-[#f8fafb] pb-12 font-sans selection:bg-[#1f8898]/30 overflow-x-hidden">
      
      {/* --- Advanced Gradient Hero Area --- */}
      <div className="bg-gradient-to-br from-[#1f8898] to-[#135a65] px-6 pt-10 pb-20 relative overflow-hidden shadow-inner">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ffffff]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-teal-100 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 backdrop-blur-sm">
                    <Wrench className="w-3.5 h-3.5" /> Maintenance & Repairs
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#ffffff] tracking-tight mb-2">
                    Service Hub
                </h1>
                <p className="text-teal-100 text-sm md:text-base font-medium max-w-xl">
                    Submit repair requests, track technician dispatch status, and review your property's maintenance history.
                </p>
            </div>

            <div className="flex mt-4 md:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ffffff] text-[#1f8898] hover:bg-gray-50 px-6 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 w-full md:w-auto"
                >
                    <Plus className="w-4 h-4" /> Report New Issue
                </button>
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 space-y-6">
        
        {/* --- TOP METRICS GRID (Bento Box) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            
            {/* Active Tickets Card */}
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${
                activeRequests > 0 
                ? 'bg-gradient-to-br from-white to-amber-50 border-amber-100' 
                : 'bg-white border-gray-100'
            }`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50 transition-opacity group-hover:opacity-70 ${activeRequests > 0 ? 'bg-amber-200' : 'bg-gray-100'}`}></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        activeRequests > 0 ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        {activeRequests > 0 && (
                            <span className="bg-amber-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">In Queue</span>
                        )}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Tickets</p>
                    <p className={`text-4xl font-black tracking-tight ${activeRequests > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {activeRequests}
                    </p>
                </div>
            </div>

            {/* Resolved Tickets Card */}
            <div className={cardClass}>
                <div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:text-[#1f8898] group-hover:bg-[#ebf3f5] group-hover:border-[#1f8898]/20 transition-all shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Resolved Issues</p>
                    <p className="text-4xl font-black text-gray-900 group-hover:text-[#1f8898] transition-colors tracking-tight">{resolvedRequests}</p>
                </div>
            </div>

            {/* Total Historical Card */}
            <div className={cardClass}>
                <div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 group-hover:text-[#1f8898] group-hover:bg-[#ebf3f5] group-hover:border-[#1f8898]/20 transition-all shrink-0">
                            <Hammer className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Lifetime Requests</p>
                    <p className="text-4xl font-black text-gray-900 group-hover:text-[#1f8898] transition-colors tracking-tight">{totalRequests}</p>
                </div>
            </div>
        </div>

        {/* --- TICKETS LIST --- */}
        <div className="bg-[#ffffff] rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <HardHat className="w-5 h-5 text-[#1f8898]" /> Ticket History
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Comprehensive log of all maintenance requests.</p>
                </div>
            </div>

            <div className="p-4 md:p-6 space-y-4">
                {requests.length === 0 ? (
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900">All Good Here!</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">You don't have any active or past maintenance requests.</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-5 justify-between items-start md:items-center hover:border-[#1f8898]/30 transition-colors group">
                            <div className="flex gap-4 items-start w-full md:w-auto">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                req.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                <Wrench className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 group-hover:text-[#1f8898] transition-colors">
                                            {req.issue_type}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                                            req.urgency === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' : 
                                            req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {req.urgency} Priority
                                        </span>
                                    </div>
                                    <p className="font-medium text-gray-600 text-sm max-w-2xl leading-relaxed">{req.description}</p>
                                    <div className="flex items-center gap-1.5 mt-2.5">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            Logged on {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-auto flex justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50">
                                <span className={`inline-flex items-center justify-center w-full md:w-auto gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                                req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}>
                                {req.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                {req.status === 'IN_PROGRESS' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {req.status === 'RESOLVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {req.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </main>

      {/* --- NEW REQUEST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-[#ffffff] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gradient-to-br from-[#1f8898] to-[#135a65] text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight">Report Issue</h2>
                        <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mt-0.5">Submit a new ticket</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Category</label>
                  <select 
                    className={inputStyle}
                    value={formData.issue_type} onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="APPLIANCE">Appliance</option>
                    <option value="GENERAL">General / Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Urgency</label>
                  <select 
                    className={inputStyle}
                    value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              {formData.urgency === 'EMERGENCY' && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex gap-3 animate-in fade-in">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                      <p className="text-[10px] text-rose-800 font-bold uppercase tracking-wider leading-relaxed">
                          For life-threatening emergencies or severe flooding, please call the property manager immediately after submitting this ticket.
                      </p>
                  </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2 ml-1">Description</label>
                <textarea 
                  required rows={4} placeholder="Please describe the issue in detail..."
                  className={`${inputStyle} resize-none`} 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto rounded-xl font-bold text-sm text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] shadow-lg shadow-[#1f8898]/20 transition-all disabled:opacity-60 active:scale-95">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}