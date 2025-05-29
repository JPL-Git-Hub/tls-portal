/**
 * Utility functions for generating and validating client portal subdomains
 */

/**
 * Generate a subdomain from client last name and mobile number
 * Format: first 4 letters of last name + last 4 digits of mobile
 * Example: "Smith" + "555-123-4567" = "smit4567"
 */
export function generateSubdomain(lastName: string, mobile: string): string {
  // Clean and normalize inputs
  const cleanLastName = lastName.trim().toLowerCase().replace(/[^a-z]/g, '');
  const cleanMobile = mobile.replace(/\D/g, ''); // Remove all non-digits
  
  // Get first 4 letters of last name (pad with 'x' if needed)
  const namePrefix = cleanLastName.substring(0, 4).padEnd(4, 'x');
  
  // Get last 4 digits of mobile
  if (cleanMobile.length < 4) {
    throw new Error('Mobile number must have at least 4 digits');
  }
  const mobileSuffix = cleanMobile.slice(-4);
  
  return `${namePrefix}${mobileSuffix}`;
}

/**
 * Validate a subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be exactly 8 characters: 4 letters + 4 digits
  const pattern = /^[a-z]{4}\d{4}$/;
  return pattern.test(subdomain);
}

/**
 * Generate a unique subdomain by appending a counter if needed
 */
export function generateUniqueSubdomain(
  lastName: string,
  mobile: string,
  existingSubdomains: string[]
): string {
  const baseSubdomain = generateSubdomain(lastName, mobile);
  
  if (!existingSubdomains.includes(baseSubdomain)) {
    return baseSubdomain;
  }
  
  let counter = 2;
  let uniqueSubdomain = `${baseSubdomain}${counter}`;
  
  while (existingSubdomains.includes(uniqueSubdomain)) {
    counter++;
    uniqueSubdomain = `${baseSubdomain}${counter}`;
  }
  
  return uniqueSubdomain;
}
