import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), '.env.example');

try {
  const envContent = fs.readFileSync(envPath, 'utf8');

  // IMPROVED REGEX:
  // 1. ^\s* -> Handles any accidental leading spaces
  // 2. ([^#\s=]+)    -> Captures the Key (no spaces, no #, no =)
  // 3. \s*=\s* -> Matches the '=' with optional surrounding spaces
  // 4. .* -> Matches the rest of the line (the value)
  // 5. Replace with  -> '$1=' (The key followed by an empty equals)
  const maskedContent = envContent.replace(/^\s*([^#\s=]+)\s*=\s*.*$/gm, '$1=');

  fs.writeFileSync(examplePath, maskedContent);
  console.log('🛡️  Sync Complete: All values (including DATABASE_URL) have been stripped.');
} catch (err) {
  console.error('❌ Sync failed:', err.message);
}