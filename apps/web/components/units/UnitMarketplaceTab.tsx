'use client';

import { useState, useRef } from 'react';
import { 
  Save, Globe, Check, Image as ImageIcon, 
  MapPin, LayoutList, Ruler, Bath, BedDouble, 
  ChevronRight, AlertCircle, ArrowRight, ArrowLeft, UploadCloud, X
} from 'lucide-react';

const AVAILABLE_AMENITIES = [
  'WiFi', 'Borehole Water', 'CCTV Security', 'Backup Generator', 
  'Balcony', 'Ample Parking', 'Swimming Pool', 'Gym', 
  'Elevator', 'Electric Fence', 'Pets Allowed', 'Pre-paid Token Meter'
];

const UNIT_TYPES = ['APARTMENT', 'HOUSE_OWN_COMPOUND', 'TOWNHOUSE', 'BEDSITTER', 'OFFICE', 'SHOP', 'WAREHOUSE'];
const CATEGORIES = ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'];
const FURNISHING = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];

export default function UnitMarketplaceTab({ unit, token }: { unit: any, token: string }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [isListed, setIsListed] = useState(unit?.is_listed || false);
  const [description, setDescription] = useState(unit?.public_description || '');
  const [amenities, setAmenities] = useState<string[]>(unit?.amenities || []);
  const [virtualTour, setVirtualTour] = useState(unit?.virtual_tour_url || '');
  
  const [propertyCategory, setPropertyCategory] = useState(unit?.property_category || 'RESIDENTIAL');
  const [unitType, setUnitType] = useState(unit?.unit_type || 'APARTMENT');
  const [furnishingStatus, setFurnishingStatus] = useState(unit?.furnishing_status || 'UNFURNISHED');
  const [bedrooms, setBedrooms] = useState(unit?.bedrooms || '');
  const [bathrooms, setBathrooms] = useState(unit?.bathrooms || '');
  const [sizeSqm, setSizeSqm] = useState(unit?.size_sqm || '');

  // --- NEW: IMAGE UPLOAD STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // --- NEW: HANDLE IMAGE SELECTION ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Prevent memory leaks
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const calculateQuality = () => {
    let score = 0;
    if (description.length > 50) score += 20;
    if (amenities.length > 2) score += 20;
    if (bedrooms || unitType === 'OFFICE' || unitType === 'SHOP') score += 20;
    if (sizeSqm) score += 20;
    if (imagePreviews.length > 0) score += 20;
    return score;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    try {
      // 1. Save the JSON details
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/listing`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          is_listed: isListed,
          public_description: description,
          amenities,
          virtual_tour_url: virtualTour,
          property_category: propertyCategory,
          unit_type: unitType,
          furnishing_status: furnishingStatus,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          size_sqm: sizeSqm ? Number(sizeSqm) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update listing details.');
      }
      
      // 2. Upload Images (if any were selected)
      if (imageFiles.length > 0) {
        setMessage('Saving details... Uploading images...');
        
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file); // 'images' matches the FilesInterceptor in the backend!
        });

        const imageRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // DO NOT set 'Content-Type': 'multipart/form-data'. 
            // The browser automatically sets this with the correct boundary when using FormData!
          },
          credentials: 'include',
          body: formData
        });

        if (!imageRes.ok) throw new Error('Details saved, but failed to upload images.');
        
        // Clear the upload queue after successful upload
        setImageFiles([]); 
      }

      setMessage('Listing & Media updated successfully!');
      setTimeout(() => setMessage(''), 4000);
      
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Error saving listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { num: 1, title: 'Classification', desc: 'Category & Type', icon: LayoutList },
    { num: 2, title: 'Features & Specs', desc: 'Rooms & Amenities', icon: Ruler },
    { num: 3, title: 'Media & Details', desc: 'Photos & Description', icon: ImageIcon },
    { num: 4, title: 'Publish', desc: 'Visibility Status', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-[#0d393f] rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[#1f8898]/10">
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">Listing Quality Score</h3>
          <p className="text-teal-100/70 text-xs">Complete as many fields as possible. High-quality listings rank higher in search results and generate more leads.</p>
        </div>
        <div className="w-full md:w-64">
          <div className="flex justify-between text-xs font-bold text-white mb-2">
            <span>{calculateQuality()}% Completed</span>
            <span>{calculateQuality() === 100 ? 'Excellent!' : 'Keep going'}</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${calculateQuality() > 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
              style={{ width: `${calculateQuality()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-1/4 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-6">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;
              
              return (
                <div 
                  key={s.num} 
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                    isActive ? 'bg-[#ebf3f5] border border-[#1f8898]/20' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-[#1f8898] text-white shadow-md' : 
                    isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPassed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="hidden lg:block">
                    <p className={`text-sm font-black ${isActive ? 'text-[#1f8898]' : 'text-gray-700'}`}>{s.title}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            
            <div className="p-6 md:p-8 flex-1">
              
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Property Classification</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Category</label>
                      <select value={propertyCategory} onChange={(e) => setPropertyCategory(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 text-sm font-medium bg-gray-50 cursor-pointer">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Unit Type</label>
                      <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 text-sm font-medium bg-gray-50 cursor-pointer">
                        {UNIT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Furnishing Status</label>
                      <div className="flex gap-3">
                        {FURNISHING.map(f => (
                          <button key={f} onClick={() => setFurnishingStatus(f)} className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${furnishingStatus === f ? 'bg-[#ebf3f5] border-[#1f8898] text-[#1f8898]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {f.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Unit Specifications</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 mb-2"><BedDouble className="w-3.5 h-3.5"/> Bedrooms</label>
                      <input type="number" min="0" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="e.g. 2" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 text-sm font-medium bg-gray-50" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 mb-2"><Bath className="w-3.5 h-3.5"/> Bathrooms</label>
                      <input type="number" step="0.5" min="0" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="e.g. 1.5" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 text-sm font-medium bg-gray-50" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 mb-2"><Ruler className="w-3.5 h-3.5"/> Size (Sqm)</label>
                      <input type="number" min="0" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} placeholder="e.g. 120" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 text-sm font-medium bg-gray-50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Unit Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_AMENITIES.map(amenity => {
                        const isSelected = amenities.includes(amenity);
                        return (
                          <button key={amenity} onClick={() => toggleAmenity(amenity)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-[#1f8898]/10 border-[#1f8898]/30 text-[#1f8898]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            {isSelected && <Check className="w-3 h-3" />} {amenity}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Marketing Content</h2>
                  
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Public Description</label>
                    <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Highlight the best features of this unit..." className="w-full rounded-xl border border-gray-200 p-4 text-sm font-medium focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all resize-none bg-gray-50" />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Virtual Tour URL</label>
                    <input type="url" value={virtualTour} onChange={(e) => setVirtualTour(e.target.value)} placeholder="https://my.matterport.com/show/?m=..." className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-[#1f8898] focus:ring-4 focus:ring-[#1f8898]/10 outline-none transition-all bg-gray-50" />
                  </div>

                  {/* FIX: ACTUAL UPLOAD INPUT & PREVIEW GRID */}
                  <div className="pt-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Image Gallery</label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-[#1f8898]/50 transition-all cursor-pointer group"
                    >
                      <div className="w-14 h-14 bg-[#ebf3f5] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6 text-[#1f8898]" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Click to browse photos</p>
                      <p className="text-xs text-gray-500">JPG, PNG, or WEBP</p>
                    </div>
                    
                    {/* Hidden input triggered by the box above */}
                    <input 
                      type="file" 
                      multiple 
                      accept="image/jpeg, image/png, image/webp" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleImageSelect} 
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 bg-white text-rose-500 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {idx === 0 && (
                              <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur">
                                Cover Photo
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Review & Publish</h2>
                  
                  <div className="bg-[#ebf3f5] rounded-2xl p-6 border border-[#1f8898]/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-black text-[#0d393f] flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#1f8898]" /> Make Listing Public
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 font-medium">
                        By turning this on, this unit will instantly become visible on the MogiRentOS public marketplace for tenants to discover and inquire about.
                      </p>
                      {unit?.status === 'OCCUPIED' && (
                        <p className="text-xs font-bold text-rose-500 mt-3 bg-rose-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-100">
                          <AlertCircle className="w-3.5 h-3.5" /> This unit is currently occupied and cannot be listed.
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setIsListed(!isListed)}
                      disabled={unit?.status === 'OCCUPIED'}
                      className={`relative inline-flex h-10 w-20 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner
                        ${isListed ? 'bg-[#1f8898]' : 'bg-gray-300'} 
                        ${unit?.status === 'OCCUPIED' ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                      `}
                    >
                      <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition duration-300 shadow-md ${isListed ? 'translate-x-11' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 md:px-8 py-5 flex items-center justify-between border-t border-gray-200">
              {currentStep > 1 ? (
                <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${message.includes('Error') ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {message}
                </span>

                {currentStep < totalSteps ? (
                  <button onClick={() => setCurrentStep(prev => prev + 1)} className="flex items-center gap-2 bg-[#0d393f] hover:bg-[#0a2c31] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#1f8898] hover:bg-[#156a77] text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#1f8898]/20">
                    {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save & Publish</>}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}