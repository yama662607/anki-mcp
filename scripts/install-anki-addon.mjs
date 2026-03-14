#!/usr/bin/env node
/**
 * Anki Addons Installer
 * Automatically downloads and installs AnkiConnect and anki-connect-extension Anki addons.
 */

import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const ANKICONNECT_REPO = 'FooSoft/anki-connect';
const EXTENSION_REPO = 'yama662607/anki-connect-extension';
const EXTENSION_NAME = 'anki_connect_extension';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log(`━${'━'.repeat(50)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`━${'━'.repeat(50)}`, 'cyan');
}

/**
 * Get Anki base folder paths for the current platform
 */
function getAnkiBasePaths() {
  const platform = process.platform;
  const home = homedir();
  const basePaths = [];

  if (platform === 'win32') {
    // Windows: %APPDATA%\Anki2
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    basePaths.push(path.join(appData, 'Anki2'));
  } else if (platform === 'darwin') {
    // macOS: ~/Library/Application Support/Anki2
    basePaths.push(path.join(home, 'Library', 'Application Support', 'Anki2'));
  } else {
    // Linux: ~/.local/share/Anki2 or $XDG_DATA_HOME/Anki2
    const xdgDataHome = process.env.XDG_DATA_HOME || path.join(home, '.local', 'share');
    basePaths.push(path.join(xdgDataHome, 'Anki2'));

    // Flatpak: ~/.var/app/net.ankiweb.Anki/data/Anki2/
    basePaths.push(path.join(home, '.var', 'app', 'net.ankiweb.Anki', 'data', 'Anki2'));
  }

  return basePaths;
}

/**
 * Find all possible addons21 folder locations
 */
function findAddonFolders() {
  const basePaths = getAnkiBasePaths();
  const addonFolders = [];

  for (const basePath of basePaths) {
    // Check top-level addons21 folder
    const topLevelAddons = path.join(basePath, 'addons21');
    if (fs.existsSync(topLevelAddons)) {
      addonFolders.push(topLevelAddons);
    }

    // Check for profile folders
    if (fs.existsSync(basePath)) {
      try {
        const entries = fs.readdirSync(basePath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            const profileAddons = path.join(basePath, entry.name, 'addons21');
            if (fs.existsSync(profileAddons)) {
              addonFolders.push(profileAddons);
            }
          }
        }
      } catch (err) {
        // Skip if we can't read the directory
      }
    }
  }

  return addonFolders;
}

/**
 * Fetch latest release information from GitHub
 */
async function getLatestRelease(repo) {
  const url = `${GITHUB_API_BASE}/repos/${repo}/releases/latest`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'anki-mcp-installer',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      log(`  API Response (${response.status}): ${body}`, 'yellow');
      if (response.status === 404) {
        throw new Error(`Repository ${repo} not found or no releases available`);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch release info for ${repo}: ${error.message}`);
  }
}

/**
 * Download a file from URL
 */
async function downloadFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  // Write file
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

/**
 * Install AnkiConnect addon
 */
async function installAnkiConnect(addonFolder) {
  logSection('Installing AnkiConnect');

  try {
    // Get latest release
    log('Fetching latest AnkiConnect release...', 'blue');
    const releaseData = await getLatestRelease(ANKICONNECT_REPO);
    const version = releaseData.tag_name;
    log(`  Latest version: ${version}`, 'green');

    // Check if already installed
    const ankiConnectFolder = path.join(addonFolder, 'anki-connect');
    if (fs.existsSync(ankiConnectFolder)) {
      log('  AnkiConnect already installed, skipping...', 'yellow');
      return { installed: false, alreadyExists: true };
    }

    // Download AnkiConnect files from plugin folder
    log('Downloading AnkiConnect files...', 'blue');

    const filesToDownload = [
      'plugin/__init__.py',
      'plugin/config.json',
      'plugin/config.md',
      'plugin/edit.py',
      'plugin/util.py',
      'plugin/web.py',
    ];

    // Create target folder
    fs.mkdirSync(ankiConnectFolder, { recursive: true });

    for (const file of filesToDownload) {
      const url = `${GITHUB_RAW_BASE}/${ANKICONNECT_REPO}/${version}/${file}`;
      const destPath = path.join(ankiConnectFolder, path.basename(file));

      try {
        await downloadFile(url, destPath);
        log(`  ✓ ${path.basename(file)}`, 'green');
      } catch (err) {
        throw new Error(`Failed to download ${file}: ${err.message}`);
      }
    }

    // Verify installation
    const initPath = path.join(ankiConnectFolder, '__init__.py');
    if (!fs.existsSync(initPath)) {
      throw new Error('AnkiConnect installation verification failed: __init__.py not found');
    }

    log(`✓ AnkiConnect v${version} installed successfully!`, 'green');
    return { installed: true, version, path: ankiConnectFolder };

  } catch (error) {
    log(`✗ AnkiConnect installation failed: ${error.message}`, 'red');
    return { installed: false, error: error.message };
  }
}

/**
 * Install anki-connect-extension addon
 */
async function installAnkiConnectExtension(addonFolder) {
  logSection('Installing AnkiConnect Extension');

  try {
    // Get latest release
    log('Fetching latest anki-connect-extension release...', 'blue');
    const releaseData = await getLatestRelease(EXTENSION_REPO);
    const version = releaseData.tag_name;
    log(`  Latest version: ${version}`, 'green');

    // Check if already installed
    const extensionFolder = path.join(addonFolder, EXTENSION_NAME);
    if (fs.existsSync(extensionFolder)) {
      log('  anki-connect-extension already installed, updating...', 'yellow');
    }

    // Download addon files
    log('Downloading addon files...', 'blue');

    const filesToDownload = [
      'addon/__init__.py',
      'addon/manifest.json',
    ];

    // Create target folder
    fs.mkdirSync(extensionFolder, { recursive: true });

    for (const file of filesToDownload) {
      const url = `${GITHUB_RAW_BASE}/${EXTENSION_REPO}/${version}/${file}`;
      const destPath = path.join(extensionFolder, path.basename(file));

      try {
        await downloadFile(url, destPath);
        log(`  ✓ ${path.basename(file)}`, 'green');
      } catch (err) {
        throw new Error(`Failed to download ${file}: ${err.message}`);
      }
    }

    // Verify installation
    const initPath = path.join(extensionFolder, '__init__.py');
    if (!fs.existsSync(initPath)) {
      throw new Error('Extension installation verification failed: __init__.py not found');
    }

    log(`✓ anki-connect-extension v${version} installed successfully!`, 'green');
    return { installed: true, version, path: extensionFolder };

  } catch (error) {
    log(`✗ Extension installation failed: ${error.message}`, 'red');
    return { installed: false, error: error.message };
  }
}

/**
 * Main installation function
 */
async function main() {
  logSection('Anki Addons Installer for anki-mcp');

  try {
    // Step 1: Find Anki addon folders
    log('Step 1: Locating Anki addons folder...', 'blue');
    const addonFolders = findAddonFolders();

    if (addonFolders.length === 0) {
      log('⚠ No Anki installation found!', 'yellow');
      log('  Please install Anki first from: https://apps.ankiweb.net/', 'cyan');
      log('  Or if Anki is installed, make sure it has been run at least once.', 'cyan');
      return;
    }

    log(`  Found ${addonFolders.length} addon folder(s):`, 'green');
    addonFolders.forEach(folder => {
      log(`    - ${folder}`, 'dim');
    });

    // Use the first found folder
    const targetAddonFolder = addonFolders[0];
    log(`  Installing to: ${targetAddonFolder}`, 'green');

    // Step 2: Install AnkiConnect
    const ankiConnectResult = await installAnkiConnect(targetAddonFolder);

    // Step 3: Install anki-connect-extension
    const extensionResult = await installAnkiConnectExtension(targetAddonFolder);

    // Summary
    logSection('Installation Summary');

    const success = ankiConnectResult.installed || ankiConnectResult.alreadyExists;
    const extensionSuccess = extensionResult.installed;

    if (success && extensionSuccess) {
      log('✓ All addons installed successfully!', 'green');
      log('', 'reset');
      log('Installed addons:', 'bright');
      if (ankiConnectResult.installed) {
        log(`  • AnkiConnect ${ankiConnectResult.version || 'latest'}`, 'cyan');
      } else if (ankiConnectResult.alreadyExists) {
        log(`  • AnkiConnect (already installed)`, 'cyan');
      }
      if (extensionResult.installed) {
        log(`  • anki-connect-extension ${extensionResult.version || 'latest'}`, 'cyan');
      }
      log('', 'reset');
      log('Next steps:', 'bright');
      log('  1. Restart Anki if it is currently running', 'reset');
      log('  2. The addons will be automatically loaded', 'reset');
      log('  3. You can verify installation in Anki: Tools → Add-ons', 'reset');
      log('', 'reset');

      process.exit(0);
    } else {
      log('⚠ Some components could not be installed', 'yellow');
      log('', 'reset');
      if (!ankiConnectResult.installed && !ankiConnectResult.alreadyExists) {
        log(`  • AnkiConnect: ${ankiConnectResult.error || 'Failed'}`, 'red');
      }
      if (!extensionResult.installed) {
        log(`  • anki-connect-extension: ${extensionResult.error || 'Failed'}`, 'red');
      }
      log('', 'reset');

      process.exit(1);
    }

  } catch (error) {
    log('', 'reset');
    logSection('Installation Failed');
    log(`✗ Error: ${error.message}`, 'red');
    log('', 'reset');
    log('Troubleshooting:', 'bright');
    log('  • Make sure you have internet connection', 'reset');
    log('  • Check that the repositories exist:', 'reset');
    log('    - https://github.com/FooSoft/anki-connect', 'dim');
    log('    - https://github.com/yama662607/anki-connect-extension', 'dim');
    log('  • Try manual installation from releases page', 'reset');
    log('', 'reset');

    process.exit(1);
  }
}

// Run the installer
main();
