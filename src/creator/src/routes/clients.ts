/**
 * Client management routes
 */

import { Router } from 'express';
import { createClient } from '../controllers/clientController';

export const clientRoutes = Router();

// Create new client
clientRoutes.post('/', createClient);
