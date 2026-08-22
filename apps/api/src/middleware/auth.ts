import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '@skillbridge/config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token',
    });
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as {
        id: string;
        email: string;
        role: string;
      };
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we continue (optional auth)
    }
  }

  next();
}

/**
 * SEC-1 remediation for the worker vertical slice.
 *
 * Authenticates the request (JWT) and resolves the caller's WorkerProfile from
 * the authenticated user — never from a URL/body `workerId`. Handlers must use
 * `req.workerProfile`, which is guaranteed present or the request is rejected.
 *
 * A valid token without a linked WorkerProfile (e.g. a student/employer token)
 * is rejected with 403, because only a worker identity may access worker data.
 */
export async function requireWorker(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Reuse the same Bearer-token check as `authenticate`.
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      id: string;
      email: string;
      role: string;
    };
    userId = decoded.id;
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  try {
    const { prisma } = await import('../db/prisma');
    const profile = await prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(403).json({
        error: 'No worker profile linked to this account',
      });
    }

    // Attach the resolved profile so handlers never re-derive identity.
    (req as AuthRequest & { workerProfileId: string }).workerProfileId =
      profile.id;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve worker profile' });
  }
}
