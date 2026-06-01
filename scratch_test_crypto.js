const crypto = require('crypto');

try {
  console.log('--- Testing DER Ed25519 base64 loading ---');
  
  // 1. Generate key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  
  // 2. Export to DER buffers
  const pubDer = publicKey.export({ type: 'spki', format: 'der' });
  const privDer = privateKey.export({ type: 'pkcs8', format: 'der' });
  
  console.log('SPKI DER Public size:', pubDer.length); // 44 bytes typically
  console.log('PKCS8 DER Private size:', privDer.length); // 48 bytes typically
  
  const publicBase64 = pubDer.toString('base64');
  const privateBase64 = privDer.toString('base64');
  
  console.log('Public Key (Base64 DER):', publicBase64);
  console.log('Private Key (Base64 DER):', privateBase64);

  // 3. Import DER keys back
  const importedPublic = crypto.createPublicKey({
    key: Buffer.from(publicBase64, 'base64'),
    format: 'der',
    type: 'spki'
  });
  
  const importedPrivate = crypto.createPrivateKey({
    key: Buffer.from(privateBase64, 'base64'),
    format: 'der',
    type: 'pkcs8'
  });
  
  console.log('Imported keys successfully!');

  // 4. Test sign and verify
  const data = Buffer.from('test_message');
  const sig = crypto.sign(null, data, importedPrivate);
  const verified = crypto.verify(null, data, importedPublic, sig);
  console.log('Signature verified:', verified); // Should be true

  // 5. Test BLAKE2b-512 digest
  const digest = crypto.createHash('blake2b512').update(data).digest('base64');
  console.log('BLAKE2b-512 Digest (Base64):', digest);

} catch (e) {
  console.error('Cryptographical DER test failed:', e);
}
