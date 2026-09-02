import { auth } from '../firebase-admin.js';

/**
 * Optional Auth middleware — extracts req.user if token exists, otherwise sets req.user = null.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (!auth) {
      req.user = null;
      return next();
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Middleware to verify Firebase ID token from Authorization header.
 * Sets req.user = { uid, email, role } on success.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!auth) {
      if (process.env.NODE_ENV === 'development') {
        req.user = { uid: 'dev-user', email: 'admin@prabhu.com', role: 'admin' };
        return next();
      }
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'user',
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to require admin role.
 * Must be used after verifyToken.
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'admin' || req.user.email === 'admin@prabhu.com') {
      return next();
    }

    const { db } = await import('../firebase-admin.js');
    if (db) {
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists && (userDoc.data().role === 'admin' || userDoc.data().email === 'admin@prabhu.com')) {
        req.user.role = 'admin';
        return next();
      }
    }

    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error('Admin check error:', error.message);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};
