/* eslint-disable */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token'); // Get token from login

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/landlords/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the secure token!
        },
        body: JSON.stringify({ companyName, contactPhone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Setup failed');
      }

      router.push('/dashboard'); // Move to main dashboard
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to RentOS!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's set up your Landlord Profile to get started.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSetup}>
          {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company / Landlord Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Mogitech Properties Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone Number</label>
              <input
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="+254 700 000 000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}