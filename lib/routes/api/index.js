const express = require('express');
const router = express.Router();

const logger = require('../../components/Logger')
const web3 = require('../../components/Web3');

const {
  successResponse,
  errorResponse
} = require('../../helpers')

const {
  verifyApiKey,
} = require('../../middleware')

// General

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})

router.get('/stats', (request, response) => {
  return successResponse(response, 'Stats', {
    uptime: process.uptime(),
  });
})

const call = async (response, description, method, args = []) => {
  try {
    const payload = args.length > 0 ? await method(...args) : await method()
    successResponse(
      response,
      description,
      payload
    )
  } catch (error) {
    errorResponse(
      response,
      error.message || error
    )
  }
}

router.get(`/getGasPrice`, verifyApiKey, (request, response) => {
  call(
    response,
    'Returns the current gas price oracle. The gas price is determined by the last few blocks median gas price.',
    web3.ipc.eth.getGasPrice
  )
})

router.get(`/isSyncing`, verifyApiKey, (request, response) => {
  call(
    response,
    'Checks if the node is currently syncing and returns either a syncing object, or false.',
    web3.ipc.eth.isSyncing
  )
})

router.get(`/getBlockNumber`, verifyApiKey, (request, response) => {
  call(
    response,
    'Returns the current block number.',
    web3.ipc.eth.getBlockNumber,
  )
})

router.get(`/getBalance/:arg`, verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Get the balance of an address at a given block.',
    web3.ipc.eth.getBalance,
    [arg]
  )
})

router.get(`/getBlock/:arg`, verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns a block matching the block number or block hash.',
    web3.ipc.eth.getBlock,
    [arg]
  )
})

router.get(`/getBlockTransactionCount/:arg`, verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the number of transaction in a given block.',
    web3.ipc.eth.getBlockTransactionCount,
    [arg]
  )
})

router.get(`/getBlockUncleCount/:arg`, verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the number of uncles in a block from a block matching the given block hash.',
    web3.ipc.eth.getBlockUncleCount,
    [arg]
  )
})


// Utils

router.get('/utils/isAddress/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Checks if a given string is a valid Ethereum address. It will also check the checksum, if the address has upper and lowercase letters.',
    web3.ipc.utils.isAddress,
    [arg]
  )
})

router.get('/utils/toChecksumAddress/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Will convert an upper or lowercase Ethereum address to a checksum address.',
    web3.ipc.utils.toChecksumAddress,
    [arg]
  )
})

router.get('/utils/checkAddressChecksum/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Checks the checksum of a given address. Will also return false on non-checksum addresses.',
    web3.ipc.utils.checkAddressChecksum,
    [arg]
  )
})

router.get('/utils/toHex/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Will auto convert any given value to HEX. Number strings will interpreted as numbers. Text strings will be interpreted as UTF-8 strings.',
    web3.ipc.utils.toHex,
    [arg]
  )
})

router.get('/utils/hexToNumberString/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the number representation of a given HEX value as a string.',
    web3.ipc.utils.hexToNumberString,
    [arg]
  )
})

router.get('/utils/hexToNumber/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the number representation of a given HEX value.',
    web3.ipc.utils.hexToNumber,
    [arg]
  )
})

router.get('/utils/numberToHex/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the HEX representation of a given number value.',
    web3.ipc.utils.numberToHex,
    [arg]
  )
})

router.get('/utils/hexToUtf8/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the UTF-8 string representation of a given HEX value.',
    web3.ipc.utils.hexToUtf8,
    [arg]
  )
})

router.get('/utils/hexToAscii/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the ASCII string representation of a given HEX value.',
    web3.ipc.utils.hexToAscii,
    [arg]
  )
})

router.get('/utils/utf8ToHex/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the HEX representation of a given UTF-8 string.',
    web3.ipc.utils.utf8ToHex,
    [arg]
  )
})

router.get('/utils/asciiToHex/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns the HEX representation of a given ASCII string.',
    web3.ipc.utils.asciiToHex,
    [arg]
  )
})

router.get('/utils/hexToBytes/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns a byte array from the given HEX string.',
    web3.ipc.utils.hexToBytes,
    [arg]
  )
})


router.get('/utils/bytesToHex/:arg', verifyApiKey, (request, response) => {
  const { arg } = request.params
  call(
    response,
    'Returns a HEX string from a byte array.',
    web3.ipc.utils.bytesToHex,
    [arg]
  )
})

module.exports = router
