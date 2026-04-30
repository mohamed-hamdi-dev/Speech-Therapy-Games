const ApiError = require('../utils/apiError');
const { verifyToken } = require('../utils/jwt');

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication token is required.'));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication is required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
