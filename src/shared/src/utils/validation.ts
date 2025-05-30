/**
 * Validation schemas using Zod
 */

import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Phone number validation with better error messages
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (phone) => {
      // Remove all non-digits
      const digits = phone.replace(/\D/g, '');
      // Check if we have exactly 10 digits (US phone)
      if (digits.length !== 10) {
        return false;
      }
      try {
        return isValidPhoneNumber(phone, 'US');
      } catch {
        return false;
      }
    },
    { 
      message: 'Please enter a valid 10-digit US phone number' 
    }
  )
  .transform((phone) => {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed?.format('NATIONAL') || phone;
  });

// Email validation with better error message
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase() // Normalize to lowercase
  .refine(
    (email) => {
      // Additional validation for common typos
      const parts = email.split('@');
      if (parts.length !== 2) return false;
      
      const domain = parts[1];
      // Check for common typos in popular domains
      const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
      if (commonTypos.includes(domain)) {
        return false;
      }
      return true;
    },
    { 
      message: 'Please check your email address for typos' 
    }
  );

// Name validation with specific error messages
export const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .min(2, 'Please enter at least 2 characters')
  .max(50, 'Please enter no more than 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/, 
    'Please use only letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => {
    // Trim whitespace and normalize multiple spaces
    return name.trim().replace(/\s+/g, ' ');
  });

// Client creation schema with improved validation
export const createClientSchema = z.object({
  firstName: nameSchema
    .refine(
      (name) => name.length >= 2,
      { message: 'First name must be at least 2 characters' }
    ),
  lastName: nameSchema
    .refine(
      (name) => name.length >= 2,
      { message: 'Last name must be at least 2 characters' }
    ),
  email: emailSchema,
  mobile: phoneSchema,
  // Optional intake form fields
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  matterType: z.enum([
    'personal-injury',
    'family-law', 
    'criminal-defense',
    'estate-planning',
    'business-law',
    'real-estate',
    'employment-law',
    'immigration',
    'other'
  ]).optional(),
  description: z.string().max(1000).optional(),
  source: z.enum(['web_form', 'admin_entry', 'import', 'intake_form']).default('web_form'),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;