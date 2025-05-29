#!/usr/bin/env node

/**
 * Check if command is being run with Yarn
 * Used in package.json scripts to enforce Yarn usage
 */

const command = process.env.npm_execpath || '';
const lifecycleEvent = process.env.npm_lifecycle_event || '';

// Check if running via npm or npx
if (command.includes('npm') || command.includes('npx')) {
  console.error('\x1b[31m%s\x1b[0m', '╔═══════════════════════════════════════════════════════════╗');
  console.error('\x1b[31m%s\x1b[0m', '║                    ⚠️  ERROR ⚠️                            ║');
  console.error('\x1b[31m%s\x1b[0m', '║                                                           ║');
  console.error('\x1b[31m%s\x1b[0m', '║  This project uses Yarn workspaces exclusively.          ║');
  console.error('\x1b[31m%s\x1b[0m', '║                                                           ║');
  console.error('\x1b[31m%s\x1b[0m', '║  Please use Yarn instead:                                ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • yarn install       (not npm install)                ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • yarn dev           (not npm run dev)                ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • yarn <package>     (not npx <package>)              ║');
  console.error('\x1b[31m%s\x1b[0m', '║                                                           ║');
  console.error('\x1b[31m%s\x1b[0m', '║  Using npm or npx can cause:                             ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • Version mismatches                                  ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • Broken workspace symlinks                           ║');
  console.error('\x1b[31m%s\x1b[0m', '║    • Inconsistent dependencies                           ║');
  console.error('\x1b[31m%s\x1b[0m', '╚═══════════════════════════════════════════════════════════╝');
  process.exit(1);
}

// Check if being run directly via node (which npx might do)
if (!command && process.argv[1] && process.argv[1].includes('check-yarn-only')) {
  // Allow direct execution for testing
  console.log('✓ Yarn-only check script is working');
  process.exit(0);
}