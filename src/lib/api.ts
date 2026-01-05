/**
 * API helper functions for making authenticated requests
 */

/**
 * Get the admin token from localStorage
 */
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin_token');
}

/**
 * Make an authenticated API request
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Make an authenticated API request with FormData (for file uploads)
 * @param url - The API endpoint URL
 * @param formData - The FormData to send
 * @returns Fetch response
 */
export async function authenticatedUpload(url: string, formData: FormData): Promise<Response> {
    const token = getToken();

    const headers: Record<string, string> = {};

    // Add Authorization header if token exists
    // Note: Don't set Content-Type for FormData - browser does it automatically with boundary
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });
}

/**
 * Handle API errors and redirect to login if unauthorized
 */
export function handleApiError(error: any, router: any) {
    if (error?.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return true;
    }
    return false;
}
