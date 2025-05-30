import { Request, Response, NextFunction } from 'express';
import { auth as firebaseAuth } from '../config/firebase';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        clientId?: string;
        role?: string;
      };
    }
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized - No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      clientId: decodedToken.clientId || decodedToken.uid, // Fallback to uid if no clientId
      role: decodedToken.role || 'client',
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};