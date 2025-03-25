const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating self-signed certificate...');

try {
  // Generate private key
  execSync('openssl genrsa -out certs/key.pem 2048', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // For Windows, we'll use a different approach for the certificate
  const isWindows = os.platform() === 'win32';
  
  if (isWindows) {
    // On Windows, create a simple configuration file
    const configPath = path.join(__dirname, '../certs/openssl.cnf');
    const configContent = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
    `;
    
    fs.writeFileSync(configPath, configContent);
    
    // Use the config file to generate the certificate
    execSync('openssl req -new -x509 -key certs/key.pem -out certs/cert.pem -days 365 -config certs/openssl.cnf', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  } else {
    // For non-Windows systems, use the original approach
    execSync('openssl req -new -key certs/key.pem -out certs/csr.pem -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    execSync('openssl x509 -req -days 365 -in certs/csr.pem -signkey certs/key.pem -out certs/cert.pem', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  }

  console.log('Certificate generated successfully!');
} catch (error) {
  console.error('Error generating certificate:', error);
  console.error('Error details:', error.message);
  process.exit(1);
} 