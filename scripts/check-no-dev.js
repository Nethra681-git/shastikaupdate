const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORES = ['node_modules', '.git', 'dist', 'build', 'android', 'ios'];
const PATTERNS = [/\[DEV\]/i, /quick\s*-?\s*login/i, /quick login as farmer/i];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for (const entry of entries) {
    if (IGNORES.includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.([cm]?ts|tsx|jsx?|html|css|md)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function check() {
  const files = walk(ROOT);
  const matches = [];
  for (const f of files) {
    try {
      const content = fs.readFileSync(f, 'utf8');
      for (const p of PATTERNS) {
        if (p.test(content)) {
          matches.push({ file: f, pattern: p.toString() });
          break;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (matches.length > 0) {
    console.error('\n[ERROR] Found developer-only markers in the repo (blocking build):\n');
    for (const m of matches) {
      console.error(` - ${m.file}  (${m.pattern})`);
    }
    console.error('\nPlease remove any [DEV] quick-login buttons or markers before building for production.');
    process.exit(1);
  }
  console.log('No dev markers found. OK to build.');
}

check();
