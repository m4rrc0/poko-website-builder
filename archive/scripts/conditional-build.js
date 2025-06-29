import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';
import { createHash } from 'crypto';
import { WORKING_DIR, CACHE_DIR, OUTPUT_DIR } from '../env.config.js';

const fileHashesFile = `${CACHE_DIR}/file-hashes.json`;
const lastBuildTimeFile = `${CACHE_DIR}/last-build-time`;

// Detect which package manager was used to run this script and capture any flags
const detectPackageManager = () => {
  // Check if script was run with Bun and capture any flags
  if (process.argv[0].includes('bun')) {
    // Get all bun-specific flags from process.execArgv
    const bunFlags = process.execArgv
      .filter(arg => arg.startsWith('--') || arg.startsWith('-'))
      .join(' ');
    
    // Return bun with any flags
    return bunFlags ? `bun ${bunFlags}` : 'bun';
  }
  
  // Check environment variables set by npm
  if (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('npm')) {
    return 'npm';
  }
  
  // Default to npm if we can't determine
  return 'npm';
};

// Get the package manager to use for running scripts
const packageManager = detectPackageManager();

// Log which package manager was detected
console.log(`Using package manager: ${packageManager}`);


// Function to calculate hash of a file
const getFileHash = (filePath) => {
  try {
    const content = readFileSync(filePath);
    return createHash('md5').update(content).digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error.message);
    return '';
  }
};

// Function to load previous hashes
const loadHashCache = () => {
  const hashCachePath = join(process.cwd(), fileHashesFile);
  if (existsSync(hashCachePath)) {
    try {
      return JSON.parse(readFileSync(hashCachePath, 'utf8'));
    } catch (error) {
      console.error('Error loading hash cache:', error.message);
    }
  }
  return {};
};

// Function to save current hashes
const saveHashCache = (hashCache) => {
  const hashCachePath = join(process.cwd(), fileHashesFile);
  try {
    const dir = dirname(hashCachePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(hashCachePath, JSON.stringify(hashCache, null, 2));
  } catch (error) {
    console.error('Error saving hash cache:', error.message);
  }
};

// Function to get modified files using content hashing
const getModifiedFilesByHash = () => {
  // Get all files to check
  const allFiles = glob.sync('**/*', { 
    ignore: [
      'node_modules/**',
      CACHE_DIR,
      `${CACHE_DIR}/**`,
      OUTPUT_DIR,
      `${OUTPUT_DIR}/**`,
      '.git/**', 
      fileHashesFile,
      lastBuildTimeFile,
      '.astro/**',
      '.wrangler/**',
      '.netlify/**',
      'public/**'
    ],
    nodir: true
  });
  
  // Load previous hashes
  const previousHashes = loadHashCache();
  const currentHashes = {};
  const modifiedFiles = [];
  
  // Check each file for changes
  for (const file of allFiles) {
    const currentHash = getFileHash(file);
    currentHashes[file] = currentHash;
    
    // If file is new or hash has changed
    if (!previousHashes[file] || previousHashes[file] !== currentHash) {
      modifiedFiles.push(file);
    }
  }
  
  // Save current hashes for next time
  saveHashCache(currentHashes);
  
  return modifiedFiles;
};

// Function to get modified files since last build
const getModifiedFiles = () => {
  // Use content hashing if USE_CONTENT_HASH env var is set
  if (process.env.USE_CONTENT_HASH) {
    console.log('Using content hash-based file change detection');
    return getModifiedFilesByHash();
  }
  
  try {
    // If .last-build-time exists, use it as reference
    const lastBuildTimePath = join(process.cwd(), lastBuildTimeFile);
    let gitCommand = 'git ls-files --modified --others --exclude-standard';
    
    if (existsSync(lastBuildTimePath)) {
      const lastBuildTime = execSync(`cat ${lastBuildTimePath}`).toString().trim();
      gitCommand = `git diff --name-only ${lastBuildTime}`;
    }
    
    return execSync(gitCommand).toString().trim().split('\n').filter(Boolean);
  } catch (error) {
    // Fallback to content hashing if git command fails
    console.log('Git command failed, falling back to content hash detection');
    return getModifiedFilesByHash();
  }
};

// Define file patterns and their corresponding build scripts
const buildMap = [
//   {
//     pattern: new RegExp(`^(?!${WORKING_DIR}/).*`),
//     script: 'build',
//     description: 'Something has changed outside of the content folder, rebuilding everything'
//   },
  {
    pattern: /^(src|cms)\//,
    script: 'build',
    description: 'CMS source files changed, rebuilding everything'
  },
  {
    pattern: /\.(js|ts|jsx|tsx|astro)$/,
    script: 'build',
    description: 'Code files changed, rebuilding everything'
  },
  {
    pattern: new RegExp(`^${WORKING_DIR}\/(_settings|_config)\/`),
    script: 'build',
    description: 'Config files changed, rebuilding everything'
  },
  {
    pattern: new RegExp(`^${WORKING_DIR}\/`),
    script: 'build:site',
    description: 'Content files changed, rebuilding site'
  },
];

// Check if output directory exists
const distDirExists = () => {
  return existsSync(join(process.cwd(), OUTPUT_DIR));
};

// Ensure tracking files exist before running the build
const ensureTrackingFiles = () => {
  const lastBuildTimePath = join(process.cwd(), lastBuildTimeFile);
  const hashCachePath = join(process.cwd(), fileHashesFile);
  let filesCreated = false;
  
  // For git-based tracking
  if (!process.env.USE_CONTENT_HASH && !existsSync(lastBuildTimePath)) {
    try {
      execSync(`git rev-parse HEAD > ${lastBuildTimeFile}`);
      console.log('Created initial build timestamp');
      filesCreated = true;
    } catch (error) {
      console.error('Error creating timestamp:', error.message);
    }
  }
  
  // For content hash-based tracking
  if (process.env.USE_CONTENT_HASH && !existsSync(hashCachePath)) {
    const allFiles = glob.sync('**/*', { 
      ignore: [
        'node_modules/**', 
        `${OUTPUT_DIR}/**`, 
        '.git/**', 
        fileHashesFile,
        lastBuildTimeFile,
        '.astro/**',
        '.wrangler/**',
        '.netlify/**',
        'public/**'
      ],
      nodir: true
    });
    
    const initialHashes = {};
    for (const file of allFiles) {
      initialHashes[file] = getFileHash(file);
    }
    
    saveHashCache(initialHashes);
    console.log('Created initial file hashes');
    filesCreated = true;
  }
  
  return filesCreated;
};

// Main function
const runConditionalBuild = () => {
  // Check if dist directory exists, if not we try to retrieve the cached version
  const needsCache = !distDirExists();
  if (needsCache) {
    console.log('Dist directory not found, trying to retrieve cached version...');
    try {
      execSync(`${packageManager} run scripts/restore-output-dir.js`, { stdio: 'inherit' });
      console.log('\nCache restored');
      execSync(`${packageManager} run build:site`, { stdio: 'inherit' });
      console.log('\nSite build complete');
      return;
    } catch (error) {
      console.error(`Error restoring cache:`, error.message);
    }
  }

  // Check if dist directory exists, if not we need a full build
  const needsFullBuild = !distDirExists();
  if (needsFullBuild) {
    console.log('Dist directory not found, running full build...');
    try {
      execSync(`${packageManager} run build`, { stdio: 'inherit' });
      console.log('\nFull build complete');
      return;
    } catch (error) {
      console.error(`Error running full build:`, error.message);
      return;
    }
  }
  
  // Ensure tracking files exist before proceeding
  const isFirstRun = ensureTrackingFiles();
  
  // Get modified files
  const modifiedFiles = getModifiedFiles();
  
  // If this is the first run after a clean and we created tracking files,
  // we should run a full build regardless of detected changes
  if (isFirstRun) {
    console.log(`First run after clean detected, running full build with ${packageManager}...`);
    try {
      execSync(`${packageManager} run build`, { stdio: 'inherit' });
      console.log('\nInitial build complete');
      return;
    } catch (error) {
      console.error(`Error running initial build:`, error.message);
      return;
    }
  }
  
  // Normal operation - check for changes
  if (!modifiedFiles.length) {
    console.log('No files changed, skipping build');
    return;
  }
  
  console.log(`Found ${modifiedFiles.length} modified files`);
  
  // Track which scripts need to be run
  const scriptsToRun = new Set();
  
  // Check each file against patterns
  modifiedFiles.forEach(file => {
    for (const { pattern, script, description } of buildMap) {
      if (pattern.test(file)) {
        scriptsToRun.add({ script, description });
        break; // Stop after first match
      }
    }
  });
  
  if (scriptsToRun.size === 0) {
    console.log('No relevant files changed, skipping build');
    return;
  }
  
  // Update last build time and hash cache BEFORE running the build
  // to prevent infinite loops
  if (!process.env.USE_CONTENT_HASH) {
    try {
      execSync(`git rev-parse HEAD > ${lastBuildTimeFile}`);
      console.log('Updated build timestamp before build');
    } catch (error) {
      console.error('Error updating timestamp:', error.message);
    }
  } else {
    // When using content hash, we've already saved the hash cache in getModifiedFilesByHash
    console.log('Updated file hashes before build');
  }
  
  // Run the scripts
  for (const { script, description } of scriptsToRun) {
    console.log(`\n${description} (using ${packageManager})`);
    try {
      execSync(`${packageManager} run ${script}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error running ${script}:`, error.message);
    }
  }
  
  console.log('\nBuild complete');
};

// Run the script
runConditionalBuild();