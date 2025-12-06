
// This file is a CLIENT-SIDE service layer. 
// It handles making API calls to the Next.js API routes.

// --- TYPES ---
export interface AdminReport {
    id: string;
    nombreCompleto: string;
    cedula: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    [key: string]: any;
}

export interface AdminData {
    stats: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
        shares: number;
    };
    reports: AdminReport[];
    totalReports: number;
}

// --- API HELPER FUNCTION ---
async function fetchFromApi<T>(url: string, token: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        // Create a custom error message to propagate status code and message
        throw new Error(`${response.status}: ${errorData.error || response.statusText}`);
    }

    // Handle responses that might not have a JSON body (e.g., 204 No Content)
    const text = await response.text();
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        // If parsing fails, it might be an empty response, which can be valid.
        return {} as T;
    }
}

// --- SERVICE FUNCTIONS ---

export const getAdminReports = async (
    token: string,
    page: number = 1,
    limit: number = 10,
    status: string = 'pending'
): Promise<AdminData> => {
    const query = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString(),
        status: status,
    }).toString();

    const url = `/api/admin/reports?${query}`;
    return fetchFromApi<AdminData>(url, token, { method: 'GET' });
};

export const updateReportsStatus = async (
    token: string,
    reportIds: string[],
    status: 'pending' | 'verified' | 'rejected'
): Promise<void> => {
    if (reportIds.length === 0) return;
    const url = '/api/admin/reports';
    await fetchFromApi(url, token, {
        method: 'PUT',
        body: JSON.stringify({ reportIds, status }),
    });
};

export const deleteMultipleReports = async (token: string, reportIds: string[]): Promise<void> => {
    if (reportIds.length === 0) return;
    const url = '/api/admin/reports';
    await fetchFromApi(url, token, {
        method: 'DELETE',
        body: JSON.stringify({ reportIds }),
    });
};