// apps/web/app/hunter/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  User, Lock, Mail, Loader2, ShieldCheck, CheckCircle2, 
  AlertCircle, Smartphone, MapPin, Bell, Save, Search, MessageCircle,Activity,
  Trash2, Plus, Eye, EyeOff, X, LogOut, UserMinus, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export default function HunterSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    receive_notifications: true
  });

  // Communication & Alert Preferences (Local/Synced)
  const [alertPrefs, setAlertPrefs] = useState({
    whatsapp_alerts: true,
    email_alerts: true,
    marketing_emails: false,
    viewing_reminders: true
  });

  // Saved Searches State
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [isAddingSearch, setIsAddingSearch] = useState(false);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    location: '',
    min_price: '',
    max_price: '',
    property_type: 'APARTMENT',
    bedrooms: '',
    alert_frequency: 'INSTANT'
  });

  // Password State
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, searchRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/dashboard`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/searches`, { credentials: 'include' }).catch(() => null)
        ]);

        if (dashRes.ok) {
          const json = await dashRes.json();
          setProfileData(prev => ({
            ...prev,
            first_name: json.user?.first_name || '',
            last_name: json.user?.last_name || '',
            email: json.user?.email || '',
            phone: json.user?.phone || '',
            receive_notifications: json.user?.receive_notifications ?? true
          }));
        }

        if (searchRes && searchRes.ok) {
          const searchesJson = await searchRes.json();
          setSavedSearches(searchesJson || []);
        } else {
          // Fallback to local storage if API is not yet available
          const localSearches = JSON.parse(localStorage.getItem('mogi_saved_searches') || '[]');
          setSavedSearches(localSearches);
        }

        // Load local communication preferences
        const savedWa = localStorage.getItem('mogi_wa_alerts');
        const savedEmail = localStorage.getItem('mogi_email_alerts');
        const savedMktg = localStorage.getItem('mogi_mktg_alerts');
        
        setAlertPrefs({
          whatsapp_alerts: savedWa !== 'false',
          email_alerts: savedEmail !== 'false',
          marketing_emails: savedMktg === 'true',
          viewing_reminders: true
        });

      } catch (error) {
        console.error("Failed to fetch settings data", error);
        toast.error("Could not load all profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      // Save local preferences
      localStorage.setItem('mogi_wa_alerts', alertPrefs.whatsapp_alerts.toString());
      localStorage.setItem('mogi_email_alerts', alertPrefs.email_alerts.toString());
      localStorage.setItem('mogi_mktg_alerts', alertPrefs.marketing_emails.toString());

      toast.success('Profile and preferences updated successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSearch.name || !newSearch.location) return toast.error("Name and Location are required.");
    
    setIsSavingSearch(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/searches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newSearch,
          min_price: newSearch.min_price ? Number(newSearch.min_price) : null,
          max_price: newSearch.max_price ? Number(newSearch.max_price) : null,
          bedrooms: newSearch.bedrooms ? Number(newSearch.bedrooms) : null,
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setSavedSearches([saved, ...savedSearches]);
      } else {
        // Fallback to local storage if API fails/missing
        const mockSaved = { id: Date.now().toString(), ...newSearch, created_at: new Date().toISOString() };
        const updated = [mockSaved, ...savedSearches];
        setSavedSearches(updated);
        localStorage.setItem('mogi_saved_searches', JSON.stringify(updated));
      }
      
      toast.success("Search profile created! We'll monitor for matches.");
      setIsAddingSearch(false);
      setNewSearch({ name: '', location: '', min_price: '', max_price: '', property_type: 'APARTMENT', bedrooms: '', alert_frequency: 'INSTANT' });
    } catch (err: any) {
      toast.error("Failed to save search. Please try again.");
    } finally {
      setIsSavingSearch(false);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hunter/searches/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const updated = savedSearches.filter(s => s.id !== id);
      setSavedSearches(updated);
      localStorage.setItem('mogi_saved_searches', JSON.stringify(updated));
      toast.success("Saved search removed.");
    } catch (err) {
      toast.error("Failed to delete search.");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters long.');

    setIsSavingPassword(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }) // Assuming API accepts currentPassword
      });

      if (!res.ok) throw new Error('Failed to update password. Check your current password.');
      
      toast.success('Security settings updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      toast.error("Sign out failed.");
    }
  };

  // --- HELPERS ---
  const calculateProfileCompletion = () => {
    let score = 0;
    if (profileData.first_name) score += 20;
    if (profileData.last_name) score += 20;
    if (profileData.phone) score += 30;
    if (savedSearches.length > 0) score += 30;
    return score;
  };

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength; // 0 to 4
  };

  const pwdStrength = calculatePasswordStrength(newPassword);
  const completionScore = calculateProfileCompletion();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-[#1f8898] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-4xl mx-auto px-4 sm:px-6 pt-8 font-sans selection:bg-[#1f8898]/30">
      
      {/* --- HEADER & PROFILE COMPLETION --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Settings & Preferences</h1>
          <p className="text-gray-500 font-medium text-sm">Manage your personal information, search profiles, and security.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm w-full md:w-64 shrink-0">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile Completion</p>
            <p className="text-sm font-black text-[#1f8898]">{completionScore}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
            <div className="bg-[#1f8898] h-full transition-all duration-700 ease-out" style={{ width: `${completionScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* --- 1. PERSONAL INFORMATION --- */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ebf3f5] rounded-xl flex items-center justify-center text-[#1f8898] shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Personal Information</h2>
              <p className="text-xs font-medium text-gray-500">Update your basic contact details</p>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" required
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-gray-50/50 text-gray-900 font-bold text-sm focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all"
                    value={profileData.first_name} 
                    onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" required
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-gray-50/50 text-gray-900 font-bold text-sm focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all"
                    value={profileData.last_name} 
                    onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Email Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input 
                    type="email" disabled 
                    className="w-full rounded-xl border border-gray-100 pl-11 pr-4 py-3 bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
                    value={profileData.email} 
                    title="Contact support to change email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Phone Number</label>
                <div className="relative flex items-center w-full rounded-xl bg-gray-50/50 border border-gray-200 overflow-hidden focus-within:border-[#1f8898] focus-within:ring-4 focus-within:ring-[#1f8898]/10 transition-all">
                  <div className="flex items-center gap-1.5 pl-4 pr-3 py-3 border-r border-gray-200 shrink-0 bg-gray-100/50">
                    <Smartphone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-900">+254</span>
                  </div>
                  <input type="tel" placeholder="712 345 678"
                    className="w-full px-4 py-3 bg-transparent outline-none font-bold text-sm text-gray-900 placeholder:text-gray-400"
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" disabled={isSavingProfile}
                className="w-full sm:w-auto bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Personal Info
              </button>
            </div>
          </form>
        </section>

        {/* --- 2 & 3. HOUSE-HUNTING PREFERENCES & SAVED SEARCHES --- */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">House-Hunting Preferences</h2>
                <p className="text-xs font-medium text-gray-500">Configure your saved searches for AI matching</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAddingSearch(!isAddingSearch)}
              className="hidden sm:flex text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors items-center gap-1.5"
            >
              {isAddingSearch ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingSearch ? 'Cancel' : 'Add New Profile'}
            </button>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50/30">
            
            {/* Create New Search Form */}
            {isAddingSearch && (
              <form onSubmit={handleSaveSearch} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-lg shadow-emerald-500/5 mb-8 animate-in slide-in-from-top-4 duration-300">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-500" /> Create Search Profile
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Search Profile Name</label>
                    <input type="text" required placeholder="e.g., Kilimani 2BR Apartment"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      value={newSearch.name} onChange={(e) => setNewSearch({...newSearch, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                      <input type="text" required placeholder="e.g., Ruiru, Kiambu"
                        className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={newSearch.location} onChange={(e) => setNewSearch({...newSearch, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Property Type</label>
                    <select 
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      value={newSearch.property_type} onChange={(e) => setNewSearch({...newSearch, property_type: e.target.value})}
                    >
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOUSE_OWN_COMPOUND">House (Own Compound)</option>
                      <option value="TOWNHOUSE">Townhouse</option>
                      <option value="BEDSITTER">Bedsitter / Studio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Budget (KSh)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min"
                        className="w-1/2 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={newSearch.min_price} onChange={(e) => setNewSearch({...newSearch, min_price: e.target.value})}
                      />
                      <input type="number" placeholder="Max"
                        className="w-1/2 rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={newSearch.max_price} onChange={(e) => setNewSearch({...newSearch, max_price: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Bedrooms</label>
                      <input type="number" placeholder="Any" min="1"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={newSearch.bedrooms} onChange={(e) => setNewSearch({...newSearch, bedrooms: e.target.value})}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Alerts</label>
                      <select 
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50 text-gray-900 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        value={newSearch.alert_frequency} onChange={(e) => setNewSearch({...newSearch, alert_frequency: e.target.value})}
                      >
                        <option value="INSTANT">Instant</option>
                        <option value="DAILY">Daily Digest</option>
                        <option value="WEEKLY">Weekly Summary</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsAddingSearch(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={isSavingSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSavingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Search
                  </button>
                </div>
              </form>
            )}

            {/* List of Saved Searches */}
            {savedSearches.length === 0 && !isAddingSearch ? (
              <div className="text-center py-10">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-600 mb-4">You have no active search profiles.</p>
                <button onClick={() => setIsAddingSearch(true)} className="bg-emerald-50 text-emerald-600 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Search Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <div key={search.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-emerald-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-gray-900 text-lg">{search.name}</h4>
                          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Active</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {search.location}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {search.property_type?.replace('_', ' ')} • 
                          {search.min_price && search.max_price ? ` KSh ${search.min_price/1000}k - ${search.max_price/1000}k` : ' Any Budget'} • 
                          {search.bedrooms ? ` ${search.bedrooms} Beds` : ' Any Beds'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end sm:flex-col gap-3 border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Bell className="w-3 h-3" /> {search.alert_frequency} ALERTS
                      </span>
                      <button onClick={() => handleDeleteSearch(search.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold">
                        <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* --- 4 & 5. SMART ALERTS & COMMUNICATION --- */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Communication & Alerts</h2>
              <p className="text-xs font-medium text-gray-500">Manage how MogiRentOS contacts you</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-4 bg-gray-50/30">
            <label className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">WhatsApp Alerts</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Instant messages for new matches and landlord responses</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent ${alertPrefs.whatsapp_alerts ? 'bg-[#25D366]' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${alertPrefs.whatsapp_alerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={alertPrefs.whatsapp_alerts} onChange={(e) => {
                const val = e.target.checked;
                setAlertPrefs({...alertPrefs, whatsapp_alerts: val});
                localStorage.setItem('mogi_wa_alerts', val.toString());
              }} />
            </label>

            <label className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Email Notifications</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Account updates, password resets, and digest summaries</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent ${alertPrefs.email_alerts ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${alertPrefs.email_alerts ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={alertPrefs.email_alerts} onChange={(e) => {
                const val = e.target.checked;
                setAlertPrefs({...alertPrefs, email_alerts: val});
                localStorage.setItem('mogi_email_alerts', val.toString());
              }} />
            </label>

            <label className="flex items-center justify-between p-5 rounded-2xl border border-gray-200 bg-white cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group opacity-80">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">Marketing & Promotions</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Occasional offers and news from MogiRentOS</p>
                </div>
              </div>
              <div className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent ${alertPrefs.marketing_emails ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${alertPrefs.marketing_emails ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={alertPrefs.marketing_emails} onChange={(e) => {
                const val = e.target.checked;
                setAlertPrefs({...alertPrefs, marketing_emails: val});
                localStorage.setItem('mogi_mktg_alerts', val.toString());
              }} />
            </label>
          </div>
        </section>

        {/* --- 6. SECURITY --- */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Security</h2>
              <p className="text-xs font-medium text-gray-500">Update your account password safely</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="p-6 sm:p-8 space-y-6 bg-gray-50/30">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Current Password</label>
              <div className="relative max-w-md">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="Enter current password"
                  className="w-full rounded-xl border border-gray-200 pl-11 pr-12 py-3 bg-white text-gray-900 font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                  value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-12 py-3 bg-white text-gray-900 font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                {/* Strength Indicator */}
                {newPassword && (
                  <div className="mt-3 space-y-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className={`flex-1 rounded-full transition-colors duration-300 ${
                          pwdStrength >= level 
                            ? (pwdStrength < 2 ? 'bg-rose-400' : pwdStrength < 4 ? 'bg-amber-400' : 'bg-emerald-500') 
                            : 'bg-gray-200'
                        }`}></div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 text-right">
                      {pwdStrength < 2 ? 'Weak' : pwdStrength < 4 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Type new password again"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-12 py-3 bg-white text-gray-900 font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" disabled={isSavingPassword || (newPassword.length > 0 && newPassword.length < 8)}
                className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Security
              </button>
            </div>
          </form>
        </section>

        {/* --- 7. ACCOUNT & DATA --- */}
        <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Account Management</h2>
              <p className="text-xs font-medium text-gray-500">Manage your active session and account status</p>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/30">
            <button onClick={handleSignOut} className="w-full sm:w-1/2 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <LogOut className="w-4 h-4" /> Sign Out of Account
            </button>
            <button onClick={() => toast.error("Account deactivation is restricted. Please contact support.")} className="w-full sm:w-1/2 py-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 hover:text-rose-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <UserMinus className="w-4 h-4" /> Deactivate Account
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}