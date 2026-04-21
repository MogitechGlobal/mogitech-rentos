// apps/web/lib/api.ts

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // We use credentials: 'include' so the browser automatically attaches the HTTP-Only cookie
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // If the backend rejects the cookie, gracefully redirect to login
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/super-admin/login';
    }
    throw new Error('Session expired');
  }

  return response;
}