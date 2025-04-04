import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authMiddleware = (restrictAccess = true) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (restrictAccess) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: No token provided',
        });
      } else {
        return next();
      }
    }
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (restrictAccess) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: Invalid token',
        });
      } else {
        return next();
      }
    }
  };
};

export default authMiddleware;
