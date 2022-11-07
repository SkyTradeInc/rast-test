const jwt = require('jsonwebtoken');

const {
  errorResponse,
} = require('../helpers')

const User = require('../models/User')

const verifyToken = (request, response, next) => {
  const { token} = request.headers;
  if(!token) return errorResponse(response, 'Token missing');
  jwt.verify(token, process.env.JWT_SECRET || '{?Fd]o#G&Wcqa)An<C@dlJT}&LG1VX', (error, decoded) => {
    if(error) return errorResponse(response, 'Token invalid or expired');
    request.token = token;
    request.decoded = decoded;
    next();
  })
};

const verifyApiKey = async (request, response, next) => {
  return next();
  // const apiKey = request.headers.authorization
  // if (!apiKey) return errorResponse(response, 'Invalid API key')
  // const user = await User.findOne({apiKey})
  // if(!user) return errorResponse(response, 'Invalid API key')
  // return next()
}

const isAdmin = (request, response, next) => {
  if(request.decoded.role !== "admin") return errorResponse(response, 'Insufficient privileges');
  next()
};

module.exports = {
  verifyToken,
  verifyApiKey,
  isAdmin
}
