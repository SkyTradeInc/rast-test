const express = require('express');
const router = express.Router();
const jwt  = require('jsonwebtoken');

const User = require('../../models/User')
const KeyPairGenerator          = require('../../components/KeyPairGenerator');
const { uuid } = require('uuidv4');

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

router.post('/requestAPI', verifyToken, isAdmin, async (request, response) => {
  const uuid = uuidv4();
  const keys = await keyPairGenerator.generate()
  User.create({ uuid, apiKey: keys.apiKey, secret: keys.secretKey })
    .then(user => {
      return successResponse(response, 'API keys generated', {apiKeys});
    })
    .catch(error => {
      console.log(error);
      return errorResponse(response, 'Something unexpected went wrong, please try again');
    })

})

router.post('/')




module.exports = router;
