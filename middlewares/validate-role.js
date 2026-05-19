'use strict';

/**
 * Middleware para validar que el usuario tenga un rol específico
 * Debe ejecutarse después de validateJWT
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
        error: 'UNAUTHORIZED',
      });
    }

    const userRole = req.user.role;

    // Normalización: Si se pide CLIENT_ROLE o USER_ROLE, permitimos cualquiera de los dos para mayor compatibilidad
    let effectiveAllowedRoles = [...allowedRoles];
    if (allowedRoles.includes('CLIENT_ROLE') && !effectiveAllowedRoles.includes('USER_ROLE')) {
      effectiveAllowedRoles.push('USER_ROLE');
    }
    if (allowedRoles.includes('USER_ROLE') && !effectiveAllowedRoles.includes('CLIENT_ROLE')) {
      effectiveAllowedRoles.push('CLIENT_ROLE');
    }

    if (!effectiveAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        error: 'FORBIDDEN',
        requiredRole: effectiveAllowedRoles,
        yourRole: userRole,
      });
    }

    next();
  };
};
