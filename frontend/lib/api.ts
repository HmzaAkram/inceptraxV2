const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: any = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Something went wrong');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
        return response.blob() as any;
    }

    return response.json();
}
