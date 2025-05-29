/**
 * Validation schemas using Zod
 */

import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Phone number validation
export const phoneSchema = z
  .string()
  .refine(
    (phone) => {
      try {
        return isValidPhoneNumber(phone, 'US');
      } catch {
        return false;
      }
    },
    { message: 'Invalid phone number' }
  )
  .transform((phone) => {
    const parsed = parsePhoneNumber(phone, 'US');
    return parsed?.format('NATIONAL') || phone;
  });

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

// Client creation schema
export const createClientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  mobile: phoneSchema,
  source: z.enum(['web_form', 'admin_entry', 'import']).default('web_form'),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
