const express = require('express');
const router = express.Router();
const jwt  = require('jsonwebtoken');

const User = require('../../models/User')

const {
  verifyToken,
  isAdmin,
  successResponse
} = require('../../middleware')

router.get('/db', verifyToken, isAdmin, (request, response) => {
  User.find({})
    .then(users => {
      return successResponse(response, 'Find users', users)
    })
})

router.delete('/db', verifyToken, isAdmin, (request, response) => {
  User.deleteMany({})
    .then(users => {
      return successResponse(response, 'Find users', users)
    })
})




module.exports = router;
