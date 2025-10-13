const { execSync } = require('child_process');

try {
  const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });

  const triggerPaths = [
    'apps/web/pre-launch/',
    'libs/web/shared',
    'libs/types/',
    'libs/sdk/leads',
    'nx.json',
    'package.json',
    'tsconfig.json',
    'tsconfig.base.json'
  ];

  const shouldBuild = triggerPaths.some(path =>
    changedFiles.split('\n').some(file => file.startsWith(path))
  );

  console.log('📋 Trigger paths:', triggerPaths.join(', '));
  console.log('🎯 Should build pre-launch dashboard:', shouldBuild);

  if (shouldBuild) {
    console.log('✅ Changes detected in pre-launch dashboard dependencies - proceeding with build');
    process.exit(1);
  } else {
    console.log('❌ No relevant changes for pre-launch dashboard - skipping deployment');
    process.exit(0);
  }
} catch (error) {
  console.log('⚠️ Error checking git changes - proceeding with build to be safe');
  console.error(error.message);
  process.exit(1);
}
