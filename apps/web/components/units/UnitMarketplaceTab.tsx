'use client';

import { useState } from 'react';
import { Save, Globe, EyeOff, Check, Image as ImageIcon } from 'lucide-react';

// Pre-defined list of popular amenities (highly relevant for the Kenyan market)
const AVAILABLE_AMENITIES = [
    'WiFi', 'Borehole Water', 'CCTV Security', 'Backup Generator',
    'Balcony', 'Ample Parking', 'Swimming Pool', 'Gym',
    'Elevator', 'Electric Fence', 'Pets Allowed', 'Pre-paid Token Meter'
];

export default function UnitMarketplaceTab({ unit, token }: { unit: any, token: string }) {
    const [isListed, setIsListed] = useState(unit?.is_listed || false);
    const [description, setDescription] = useState(unit?.public_description || '');
    const [amenities, setAmenities] = useState<string[]>(unit?.amenities || []);
    const [virtualTour, setVirtualTour] = useState(unit?.virtual_tour_url || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/${unit.id}/listing`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include', // <-- ADD THIS LINE! This sends your auth cookies.
                body: JSON.stringify({
                    is_listed: isListed,
                    public_description: description,
                    amenities,
                    virtual_tour_url: virtualTour,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to update listing');
            }

            setMessage('Listing updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            console.error(error);
            setMessage(error.message || 'Error saving listing details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* STATUS HEADER */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-[#1f8898]" />
                        Public Marketplace Status
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Toggle this switch to make this unit visible to thousands of potential tenants.
                    </p>

                    {/* Show a warning if the unit is occupied */}
                    {unit?.status === 'OCCUPIED' && (
                        <p className="text-xs font-bold text-rose-500 mt-2 bg-rose-50 inline-block px-2 py-1 rounded-md border border-rose-100">
                            This unit is currently occupied and cannot be listed.
                        </p>
                    )}
                </div>

                {/* Sleek Custom Toggle (Disabled if OCCUPIED) */}
                <button
                    onClick={() => setIsListed(!isListed)}
                    disabled={unit?.status === 'OCCUPIED'}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none 
            ${isListed ? 'bg-[#1f8898]' : 'bg-gray-200'} 
            ${unit?.status === 'OCCUPIED' ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
          `}
                >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-300 ${isListed ? 'translate-x-9 shadow-md' : 'translate-x-1 shadow-sm'}`} />
                </button>
            </div>

            {/* LISTING DETAILS FORM */}
            <div className={`transition-all duration-300 ${!isListed && 'opacity-50 pointer-events-none grayscale-[30%]'}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 space-y-6">

                        {/* Description Area */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Public Description</label>
                            <p className="text-xs text-gray-500 mb-3">Highlight the best features of this unit. What makes it unique?</p>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., A stunning, naturally lit 2-bedroom apartment with modern finishes..."
                                className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] outline-none transition-all resize-none"
                            />
                        </div>

                        <hr className="border-gray-100" />

                        {/* Interactive Amenities Grid */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-3">Amenities</label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_AMENITIES.map(amenity => {
                                    const isSelected = amenities.includes(amenity);
                                    return (
                                        <button
                                            key={amenity}
                                            onClick={() => toggleAmenity(amenity)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected
                                                    ? 'bg-[#1f8898]/10 border-[#1f8898]/30 text-[#1f8898]'
                                                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                            {amenity}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Virtual Tour / External Media */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Virtual Tour URL (Optional)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                    <ImageIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    value={virtualTour}
                                    onChange={(e) => setVirtualTour(e.target.value)}
                                    placeholder="https://my.matterport.com/show/?m=..."
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#1f8898] focus:ring-1 focus:ring-[#1f8898] outline-none transition-all"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Footer & Action Button */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                        <span className={`text-sm font-bold ${message.includes('Error') ? 'text-rose-500' : 'text-[#1f8898]'}`}>
                            {message}
                        </span>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#1f8898] hover:bg-[#156a77] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Listing</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}