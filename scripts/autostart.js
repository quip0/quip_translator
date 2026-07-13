#!/usr/bin/env node
// Install/uninstall a macOS LaunchAgent so the translator starts at login.
// Usage: node scripts/autostart.js [install|uninstall]

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const LABEL = 'com.quipo.translator';
const appDir = path.join(__dirname, '..');
const electronBin = path.join(appDir, 'node_modules', '.bin', 'electron');
const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${electronBin}</string>
    <string>${appDir}</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/tmp/${LABEL}.log</string>
  <key>StandardErrorPath</key><string>/tmp/${LABEL}.log</string>
</dict>
</plist>
`;

const cmd = process.argv[2] || 'install';

if (cmd === 'install') {
  if (!fs.existsSync(electronBin)) {
    console.error('electron binary not found — run `npm install` first');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(plistPath), { recursive: true });
  fs.writeFileSync(plistPath, plist);
  try { execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' }); } catch {}
  execSync(`launchctl load "${plistPath}"`);
  console.log(`Installed and started: ${plistPath}`);
} else if (cmd === 'uninstall') {
  try { execSync(`launchctl unload "${plistPath}"`, { stdio: 'ignore' }); } catch {}
  if (fs.existsSync(plistPath)) fs.unlinkSync(plistPath);
  console.log('Autostart removed');
} else {
  console.error('Usage: node scripts/autostart.js [install|uninstall]');
  process.exit(1);
}
