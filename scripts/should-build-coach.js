const { execSync } = require('child_process');

try {
  // Get changed files from git
  const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });

  // Define paths that should trigger the coach dashboard build
  const triggerPaths = [
    'apps/web/coach/',
    'libs/web/',
    'libs/types/',
    'libs/sdk/',
    'nx.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.base.json'
  ];

  // Check if any changed files match our trigger paths
  const shouldBuild = triggerPaths.some(path =>
    changedFiles.split('\n').some(file => file.startsWith(path))
  );

  if (shouldBuild) {
    console.log('✅ Changes detected in coach dashboard dependencies - proceeding with build');
    process.exit(0); // Exit code 1 = proceed with build
  } else {
    console.log('❌ No relevant changes for coach dashboard - canceling build');
    process.exit(1); // Exit code 0 = cancel build
  }
} catch (error) {
  console.log('⚠️ Error checking git changes - proceeding with build to be safe');
  console.error(error.message);
  process.exit(1); // Build anyway if we can't determine changes
}
