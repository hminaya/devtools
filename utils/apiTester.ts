/**
 * API testing utilities
 */

export type ApiResponse = {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: string;
  error?: string;
  responseTime?: number;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export async function testApi(
  url: string,
  method: HttpMethod,
  customHeaders?: Record<string, string>,
  requestBody?: string,
): Promise<ApiResponse> {
  const startTime = performance.now();

  try {
    const fetchHeaders: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      ...customHeaders,
    };

    const supportsBody = ['POST', 'PUT', 'PATCH'].includes(method);

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      ...(supportsBody && requestBody ? { body: requestBody } : {}),
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Get headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get response body (HEAD requests have no body per HTTP spec)
    let responseBody = '';
    if (method !== 'HEAD') {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        responseBody = JSON.stringify(json, null, 2);
      } else {
        responseBody = await response.text();
      }
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      responseTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch',
      responseTime,
    };
  }
}
