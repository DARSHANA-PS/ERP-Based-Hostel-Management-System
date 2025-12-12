const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.userId = decoded.id;
      req.userRole = decoded.role;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  next();
};

const wardenOnly = (req, res, next) => {
  if (req.userRole !== 'warden' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Warden or Admin only.'
    });
  }
  next();
};

module.exports = { protect, adminOnly, wardenOnly };
