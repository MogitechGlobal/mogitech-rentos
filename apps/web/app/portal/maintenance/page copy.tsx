//apps/web/app/portal/maintenance/page.tsx
/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Wrench, Plus, AlertCircle, Clock, 
  CheckCircle2, Loader2, X, Info 
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/maintenance', {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/maintenance', {
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

  if (isLoading) return <div className="h-[80vh] flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-[#1f8898]" /></div>;

  return (
    <div className="p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Maintenance</h1>
          <p className="text-gray-500 font-medium mt-1">Submit repair requests and track their resolution status.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1f8898] hover:bg-[#1a7684] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" /> Report Issue
        </button>
      </div>

      {error && <div className="p-4 mb-6 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 font-bold">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#ebf3f5] rounded-2xl flex items-center justify-center mb-4 text-[#1f8898]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900">All Good Here!</h2>
            <p className="text-gray-500 font-medium mt-2">You don't have any active or past maintenance requests.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-[#1f8898]/30 transition-colors">
              <div className="flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  req.status === 'RESOLVED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{req.issue_type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      req.urgency === 'EMERGENCY' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.urgency} Priority
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm max-w-2xl">{req.description}</p>
                  <p className="text-xs text-gray-400 font-medium mt-2">
                    Submitted on {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex justify-end">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border ${
                  req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  req.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  'bg-green-50 text-green-600 border-green-200'
                }`}>
                  {req.status === 'PENDING' && <Clock className="w-4 h-4" />}
                  {req.status === 'IN_PROGRESS' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {req.status === 'RESOLVED' && <CheckCircle2 className="w-4 h-4" />}
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- NEW REQUEST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#ffffff] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfdfe]">
              <h2 className="text-xl font-black text-gray-900">Report an Issue</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Category</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] text-sm font-medium bg-white"
                    value={formData.issue_type} onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="APPLIANCE">Appliance</option>
                    <option value="GENERAL">General / Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Urgency</label>
                  <select 
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] text-sm font-medium bg-white"
                    value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 ml-1">Description</label>
                <textarea 
                  required rows={4} placeholder="Please describe the issue in detail..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] text-sm font-medium text-gray-700 resize-none" 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-[#ffffff] bg-[#1f8898] hover:bg-[#1a7684] shadow-md transition-all disabled:opacity-60">
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