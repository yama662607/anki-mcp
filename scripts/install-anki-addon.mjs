#!/usr/bin/env node
/**
 * AnkiConnect Extension Installer
 * Automatically downloads and installs the anki-connect-extension Anki addon.
 */

import fs from 'node:fs';
import path from 'node:path';
import { homedir } from 'node:os';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
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
async function getLatestRelease() {
  const url = `${GITHUB_API_BASE}/repos/${EXTENSION_REPO}/releases/latest`;

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
        throw new Error(`Repository ${EXTENSION_REPO} not found or no releases available`);
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch release info: ${error.message}`);
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

  // Stream the response to file
  const fileStream = createWriteStream(destPath);
  await pipeline(response.body, fileStream);
}

/**
 * Extract addon content from .ankiaddon file (which is a ZIP file)
 * Since we can't use external dependencies, we'll download individual files
 */
async function downloadAddonFiles(releaseData, destFolder) {
  const tag = releaseData.tag_name;
  const targetFolder = path.join(destFolder, EXTENSION_NAME);

  // Create target folder
  fs.mkdirSync(targetFolder, { recursive: true });

  // Download individual files from the repository
  const filesToDownload = [
    'addon/__init__.py',
    'addon/manifest.json',
  ];

  log('Downloading addon files...', 'blue');

  for (const file of filesToDownload) {
    const url = `${GITHUB_RAW_BASE}/${EXTENSION_REPO}/${tag}/${file}`;
    const destPath = path.join(targetFolder, path.basename(file));

    try {
      await downloadFile(url, destPath);
      log(`  ✓ ${path.basename(file)}`, 'green');
    } catch (err) {
      throw new Error(`Failed to download ${file}: ${err.message}`);
    }
  }

  return targetFolder;
}

/**
 * Main installation function
 */
async function main() {
  logSection('AnkiConnect Extension Installer');

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
      log(`    - ${folder}`, 'reset');
    });

    // Use the first found folder
    const targetAddonFolder = addonFolders[0];
    log(`  Installing to: ${targetAddonFolder}`, 'green');

    // Step 2: Get latest release info
    log('Step 2: Fetching latest release from GitHub...', 'blue');
    const releaseData = await getLatestRelease();
    const version = releaseData.tag_name;
    log(`  Latest version: ${version}`, 'green');

    // Step 3: Download and install addon files
    log('Step 3: Installing addon files...', 'blue');
    const installedPath = await downloadAddonFiles(releaseData, targetAddonFolder);

    // Verify installation
    const initPath = path.join(installedPath, '__init__.py');
    if (!fs.existsSync(initPath)) {
      throw new Error('Installation verification failed: __init__.py not found');
    }

    // Success!
    logSection('Installation Complete!');
    log(`✓ AnkiConnect Extension v${version} installed successfully!`, 'green');
    log('', 'reset');
    log('Location:', 'bright');
    log(`  ${installedPath}`, 'cyan');
    log('', 'reset');
    log('Next steps:', 'bright');
    log('  1. Restart Anki if it is currently running', 'reset');
    log('  2. The addon will be automatically loaded by AnkiConnect', 'reset');
    log('  3. You can verify installation in Anki: Tools → Add-ons', 'reset');
    log('', 'reset');

    // Exit with success
    process.exit(0);

  } catch (error) {
    log('', 'reset');
    logSection('Installation Failed');
    log(`✗ Error: ${error.message}`, 'red');
    log('', 'reset');
    log('Troubleshooting:', 'bright');
    log('  • Make sure you have internet connection', 'reset');
    log('  • Check that the repository exists: https://github.com/yama662607/anki-connect-extension', 'reset');
    log('  • Try manual installation from releases page', 'reset');
    log('', 'reset');

    process.exit(1);
  }
}

// Run the installer
main();
