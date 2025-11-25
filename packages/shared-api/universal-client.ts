/**
 * AZORA UNIVERSAL API CLIENT
 * 
 * Generic API client that works for all apps and services
 * Features: Retry logic, error handling, environment-based URLs, TypeScript support
 * 
 * Usage:
 * const client = createApiClient({ baseURL: 'http://localhost:4000' });
 * const data = await client.get('/api/courses');
 */

export interface ApiClientConfig {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
    services?: Record<string, string>;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}

class UniversalApiClient {
    private config: Required<ApiClientConfig>;

    constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
            headers: config.headers || {},
            services: config.services || {},
        };
    }

    /**
     * Generic request method with retry logic
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = this.buildUrl(endpoint);
        const headers = this.buildHeaders(options.headers);

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const response = await fetch(url, {
                    ...options,
                    headers,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw await this.handleErrorResponse(response);
                }

                const data = await response.json();

                return {
                    data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                };
            } catch (error) {
                lastError = error as Error;

                // Don't retry on client errors (4xx)
                if (error instanceof Error && 'status' in error &&
                    (error as any).status >= 400 && (error as any).status < 500) {
                    throw error;
                }

                // Wait before retrying
                if (attempt < this.config.retries) {
                    await this.delay(this.config.retryDelay * (attempt + 1));
                }
            }
        }

        throw lastError || new Error('Request failed after retries');
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        });
        return response.data;
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
        return response.data;
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
        return response.data;
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        });
        return response.data;
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
        const response = await this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
        return response.data;
    }

    /**
     * Build full URL from endpoint
     */
    private buildUrl(endpoint: string): string {
        // If endpoint is already a full URL, return it
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }

        // Check if endpoint matches a service shorthand
        for (const [service, path] of Object.entries(this.config.services)) {
            if (endpoint.startsWith(`@${service}`)) {
                return `${this.config.baseURL}${path}${endpoint.slice(service.length + 1)}`;
            }
        }

        // Default: append to baseURL
        const base = this.config.baseURL.endsWith('/')
            ? this.config.baseURL.slice(0, -1)
            : this.config.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        return `${base}${path}`;
    }

    /**
     * Build headers with defaults
     */
    private buildHeaders(customHeaders?: HeadersInit): Headers {
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...this.config.headers,
        });

        if (customHeaders) {
            const custom = new Headers(customHeaders);
            custom.forEach((value, key) => {
                headers.set(key, value);
            });
        }

        return headers;
    }

    /**
     * Handle error responses
     */
    private async handleErrorResponse(response: Response): Promise<ApiError> {
        let errorData: any;

        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText };
        }

        const error: ApiError = {
            message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            code: errorData.code,
            details: errorData,
        };

        return error;
    }

    /**
     * Delay helper for retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<ApiClientConfig>): void {
        this.config = {
            ...this.config,
            ...config,
            headers: {
                ...this.config.headers,
                ...config.headers,
            },
            services: {
                ...this.config.services,
                ...config.services,
            },
        };
    }

    /**
     * Set authorization token
     */
    setAuthToken(token: string): void {
        this.updateConfig({
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    /**
     * Clear authorization token
     */
    clearAuthToken(): void {
        const { Authorization, ...headers } = this.config.headers;
        this.config.headers = headers;
    }
}

/**
 * Create API client instance
 */
export function createApiClient(config?: ApiClientConfig): UniversalApiClient {
    return new UniversalApiClient(config);
}

/**
 * Default client instance
 */
export const apiClient = createApiClient({
    services: {
        education: '/api/education',
        mint: '/api/mint',
        ai: '/api/ai',
        marketplace: '/api/marketplace',
        forge: '/api/forge',
    },
});

export default apiClient;
