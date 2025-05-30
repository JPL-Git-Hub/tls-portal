/**
 * Client controller - handles client creation and management
 */

import { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/firebase';
import { 
  createClientSchema, 
  generateSubdomain, 
  generateUniqueSubdomain,
  Client 
} from '@tls-portal/shared';
import { sendClientWelcomeEmail, sendNotificationToLawyer } from '../services/emailService';

export async function createClient(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Validate request body
    const validatedData = createClientSchema.parse(req.body);
    
    // Get tenant ID (hardcoded for now, will come from auth later)
    const tenantId = 'default-tenant';
    
    // Check existing subdomains for this tenant
    const db = getDb();
    const existingClients = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .select('subdomain')
      .get();
    
    const existingSubdomains = existingClients.docs.map(doc => doc.data().subdomain);
    
    // Generate unique subdomain
    const subdomain = generateUniqueSubdomain(
      validatedData.lastName,
      validatedData.mobile,
      existingSubdomains
    );
    
    // Create client document
    const now = new Date();
    const clientData: Omit<Client, 'id'> = {
      tenantId,
      subdomain,
      profile: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        mobile: validatedData.mobile,
        createdAt: now,
        updatedAt: now
      },
      metadata: {
        source: validatedData.source || 'web_form',
        tags: []
      },
      status: 'active',
      portalUrl: `https://${subdomain}.${process.env.DOMAIN || 'thelawshop.com'}`,
      createdAt: now,
      updatedAt: now,
      createdBy: 'system', // Will be replaced with auth user
      lastModifiedBy: 'system'
    };
    
    // Save to Firestore
    const docRef = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('clients')
      .add(clientData);
    
    // Create full client object
    const createdClient: Client = {
      id: docRef.id,
      ...clientData
    };
    
    // Send email notifications (non-blocking)
    Promise.all([
      sendClientWelcomeEmail(createdClient),
      sendNotificationToLawyer(createdClient)
    ]).catch(error => {
      // Log email errors but don't fail the request
      console.error('Email notification error:', error);
    });
    
    // Return created client
    res.status(201).json(createdClient);
    
  } catch (error) {
    next(error);
  }
}
