const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating self-signed certificate using Node.js crypto...');

try {
  // Generate key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Write private key to file
  fs.writeFileSync(path.join(certsDir, 'key.pem'), privateKey);

  // Create a self-signed certificate
  const cert = crypto.createCertificate();
  
  // Set subject
  cert.setSubject([
    { name: 'commonName', value: 'localhost' }
  ]);
  
  // Set issuer (same as subject for self-signed)
  cert.setIssuer([
    { name: 'commonName', value: 'localhost' }
  ]);
  
  // Set validity period
  const now = Date.now();
  const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
  cert.setStart(new Date(now));
  cert.setEnd(new Date(oneYearFromNow));
  
  // Set extensions
  cert.setExtensions([
    {
      name: 'basicConstraints',
      critical: true,
      value: {
        ca: false
      }
    },
    {
      name: 'keyUsage',
      critical: true,
      value: ['digitalSignature', 'keyEncipherment']
    },
    {
      name: 'subjectAltName',
      critical: false,
      value: [
        { type: 'dns', value: 'localhost' },
        { type: 'ip', value: '127.0.0.1' }
      ]
    }
  ]);
  
  // Sign the certificate with the private key
  cert.sign(privateKey, 'sha256');
  
  // Export the certificate
  const certificate = cert.getPEM();
  
  // Write certificate to file
  fs.writeFileSync(path.join(certsDir, 'cert.pem'), certificate);

  console.log('Certificate generated successfully!');
} catch (error) {
  console.error('Error generating certificate:', error);
  process.exit(1);
} 