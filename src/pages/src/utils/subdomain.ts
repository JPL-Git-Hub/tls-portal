/**
 * Subdomain detection and routing utilities
 */

/**
 * Extract subdomain from hostname
 * @param hostname - The full hostname (e.g., "smit1234.portal.thelawshop.com")
 * @returns The subdomain or null if none exists
 */
export function getSubdomain(hostname: string = window.location.hostname): string | null {
  // Handle localhost development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain in development via query param
    const params = new URLSearchParams(window.location.search);
    return params.get('subdomain');
  }

  // Split hostname into parts
  const parts = hostname.split('.');
  
  // Need at least 3 parts for a subdomain (subdomain.domain.tld)
  if (parts.length < 3) {
    return null;
  }
  
  // First part is the subdomain
  const subdomain = parts[0];
  
  // Ignore common non-client subdomains
  const ignoredSubdomains = ['www', 'app', 'api', 'admin', 'portal'];
  if (ignoredSubdomains.includes(subdomain.toLowerCase())) {
    return null;
  }
  
  return subdomain;
}

/**
 * Check if current request is for a client portal
 * @returns true if this is a client portal subdomain
 */
export function isClientPortal(): boolean {
  return getSubdomain() !== null;
}

/**
 * Get the base domain without subdomain
 * @param hostname - The full hostname
 * @returns The base domain (e.g., "portal.thelawshop.com")
 */
export function getBaseDomain(hostname: string = window.location.hostname): string {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return hostname;
  }
  
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    // Remove the subdomain
    return parts.slice(1).join('.');
  }
  
  return hostname;
}

/**
 * Build a URL for a specific subdomain
 * @param subdomain - The client subdomain
 * @param path - Optional path to append
 * @returns Full URL for the subdomain
 */
export function buildSubdomainUrl(subdomain: string, path: string = '/'): string {
  const protocol = window.location.protocol;
  const baseDomain = getBaseDomain();
  const port = window.location.port ? `:${window.location.port}` : '';
  
  // Handle localhost development
  if (baseDomain === 'localhost' || baseDomain === '127.0.0.1') {
    return `${protocol}//${baseDomain}${port}${path}?subdomain=${subdomain}`;
  }
  
  return `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
}

/**
 * Redirect to main app if not on a client subdomain
 * Useful for ensuring portal routes are only accessible via subdomain
 */
export function requireClientSubdomain(): void {
  if (!isClientPortal()) {
    // Redirect to main marketing site or show error
    window.location.href = '/';
  }
}