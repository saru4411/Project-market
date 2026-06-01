// middlewares/becknSecurity.js — Ed25519 & BLAKE2b-512 ONDC/Beckn Cryptography Engine
'use strict';

const crypto = require('crypto');
const logger = require('../config/logger');

// ── Static Cryptographically Valid Participant DER Keyring (ONDC/Beckn Sandbox) ────
const KEYRING = {
  // Buyer App (BuyEway Gateway)
  'buyer-app.buyeway.com|key1': {
    publicKey: 'MCowBQYDK2VwAyEA/l4p6h4Tnn460X0YWEO+PSR2ai6QJ1ssUsg+qOxJhMo=',
    privateKey: 'MC4CAQAwBQYDK2VwBCIEIDuwcyIM66MlX0dQN/MNaceyt3uL1wNhoTIVD5eqM6/3'
  },
  // Decentralized Open Supplier Node 1
  'supplier-node-1.com|key1': {
    publicKey: 'MCowBQYDK2VwAyEAdO1sVvjc/tVL4xuO5+j+WAxXaGrU27ioM+jieQpXbK4=',
    privateKey: 'MC4CAQAwBQYDK2VwBCIEIHLWFvReGBRkjeLkpSPRO7NRovCjMTF6oq4mCxR0OGF7'
  }
};

/**
 * Generate BLAKE2b-512 message digest for a payload (base64 encoded)
 * @param {string|Buffer} body 
 * @returns {string}
 */
function calculateDigest(body) {
  const payload = Buffer.isBuffer(body) ? body : (typeof body === 'string' ? body : JSON.stringify(body || {}));
  return crypto.createHash('blake2b512').update(payload).digest('base64');
}

/**
 * Generate standard Beckn/ONDC authorization headers
 * @param {object} body - Request payload
 * @param {string} keyId - Sender subscriber + key identifier
 * @param {string} privateKeyBase64 - Sender DER private key base64
 * @returns {object} { authorization, digest }
 */
function generateBecknHeaders(body, keyId, privateKeyBase64) {
  const digestVal = `BLAKE-512=${calculateDigest(body)}`;
  const created = Math.floor(Date.now() / 1000);
  const expires = created + 600; // 10 minutes expiry

  // Construct standard HTTP signing string
  const signingString = `(created): ${created}\n(expires): ${expires}\ndigest: ${digestVal}`;
  
  try {
    const privateKeyObj = crypto.createPrivateKey({
      key: Buffer.from(privateKeyBase64, 'base64'),
      format: 'der',
      type: 'pkcs8'
    });

    const sigBuffer = crypto.sign(null, Buffer.from(signingString), privateKeyObj);
    const signature = sigBuffer.toString('base64');

    const authHeader = `Signature keyId="${keyId}",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;

    return {
      'Authorization': authHeader,
      'Digest': digestVal
    };
  } catch (err) {
    logger.error({ msg: 'Failed to generate Beckn cryptographic headers', err: err.message });
    throw new Error(`Beckn signing failure: ${err.message}`);
  }
}

/**
 * Inbound Express middleware to verify Beckn cryptographic headers
 */
function verifyBecknSignature(req, res, next) {
  // Allow OPTIONS preflights
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const digestHeader = req.headers['digest'];

  if (!authHeader) {
    logger.warn({ msg: 'Missing Authorization header in Beckn request', url: req.originalUrl });
    return res.status(401).json({ error: 'Unauthorized: Missing Authorization Beckn header' });
  }

  // Parse HTTP Signature attributes
  // Pattern: keyId="...",algorithm="...",created="...",expires="...",headers="...",signature="..."
  const keyIdMatch = authHeader.match(/keyId="([^"]+)"/);
  const algorithmMatch = authHeader.match(/algorithm="([^"]+)"/);
  const createdMatch = authHeader.match(/created="([^"]+)"/);
  const expiresMatch = authHeader.match(/expires="([^"]+)"/);
  const headersMatch = authHeader.match(/headers="([^"]+)"/);
  const signatureMatch = authHeader.match(/signature="([^"]+)"/);

  if (!keyIdMatch || !signatureMatch || !createdMatch || !expiresMatch) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Authorization header structure' });
  }

  const keyId = keyIdMatch[1];
  const algorithm = algorithmMatch ? algorithmMatch[1] : 'ed25519';
  const created = createdMatch[1];
  const expires = expiresMatch[1];
  const signature = signatureMatch[1];
  const headerList = headersMatch ? headersMatch[1] : '(created) (expires) digest';

  // 1. Verify Expiry
  const now = Math.floor(Date.now() / 1000);
  if (now > parseInt(expires)) {
    return res.status(401).json({ error: 'Unauthorized: Beckn request signature has expired' });
  }

  // 2. Fetch public key from Keyring
  const participant = KEYRING[keyId];
  if (!participant) {
    logger.warn({ msg: 'Rejecting unsigned Beckn request: Unknown keyId in keyring', keyId });
    return res.status(401).json({ error: `Unauthorized: Unknown subscriber key identifier: ${keyId}` });
  }

  // 3. Verify Body Digest (Integrity check)
  if (headerList.includes('digest')) {
    if (!digestHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing Digest header for message integrity check' });
    }
    const computedDigest = `BLAKE-512=${calculateDigest(req.rawBody || req.body)}`;
    if (digestHeader !== computedDigest) {
      logger.warn({ msg: 'Beckn request payload digest mismatch', expected: computedDigest, received: digestHeader });
      return res.status(401).json({ error: 'Unauthorized: Message body digest validation failed (tampered payload)' });
    }
  }

  // 4. Verify Cryptographic Signature
  try {
    // Reconstruct signing string in exact header order
    const parts = [];
    headerList.split(' ').forEach(h => {
      if (h === '(created)') parts.push(`(created): ${created}`);
      else if (h === '(expires)') parts.push(`(expires): ${expires}`);
      else if (h === 'digest') parts.push(`digest: ${digestHeader}`);
    });
    const signingString = parts.join('\n');

    const publicKeyObj = crypto.createPublicKey({
      key: Buffer.from(participant.publicKey, 'base64'),
      format: 'der',
      type: 'spki'
    });

    const isVerified = crypto.verify(
      null,
      Buffer.from(signingString),
      publicKeyObj,
      Buffer.from(signature, 'base64')
    );

    if (!isVerified) {
      logger.warn({ msg: 'Beckn cryptographic verification failed', keyId });
      return res.status(401).json({ error: 'Unauthorized: Cryptographic signature verification failed' });
    }

    // Pass validated participant context down the request
    req.becknParticipant = {
      keyId,
      subscriberId: keyId.split('|')[0]
    };
    next();
  } catch (err) {
    logger.error({ msg: 'Inbound Beckn signature verification crashed', err: err.message });
    return res.status(500).json({ error: `Security filter crash: ${err.message}` });
  }
}

module.exports = {
  KEYRING,
  calculateDigest,
  generateBecknHeaders,
  verifyBecknSignature
};
