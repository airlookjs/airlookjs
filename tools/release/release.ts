// @ts-check
// should be able to rename to .ts and run with tsx but facing issues with changelog renderer import
import { execSync } from 'child_process';

import { releaseChangelog, releasePublish, releaseVersion } from 'nx/release/index.js';
import yargs from 'yargs';


const options = await yargs(process.argv.slice(2))
  .version(false)
  .option('version', {
    description:
      'Explicit version specifier to use, if overriding conventional commits',
    type: 'string',
  })
  .option('dryRun', {
    alias: 'd',
    description:
      'Whether to perform a dry-run of the release process, defaults to true',
    type: 'boolean',
    default: true,
  })
  .option('verbose', {
    description: 'Whether or not to enable verbose logging, defaults to false',
    type: 'boolean',
    default: false,
  })
  .parseAsync();

const { workspaceVersion, projectsVersionData } = await releaseVersion({
  specifier: options.version,
  // stage package.json updates to be committed later by the changelog command
  stageChanges: true,
  dryRun: options.dryRun,
  verbose: options.verbose,

});

console.log('📦 Workspace version:', workspaceVersion);
console.log('📦 Projects version data:', projectsVersionData);

// This will create a release on GitHub
const releaseChangelogResult = await releaseChangelog({
  versionData: projectsVersionData,
  version: workspaceVersion,
  dryRun: options.dryRun,
  verbose: options.verbose,
  createRelease: 'github',
});

if (workspaceVersion === null) {
  console.log(
    '⏭️ No changes detected across any package, skipping publish step altogether',
  );
} else {

  //const projectsFilter = projectsToRelease.join(',');

    // We need to trigger the build after the new releases for the projects have been created
  // This ensures that the package.json output to the `dist` folder contains the latest version
  execSync(
    `pnpm nx run-many --target=build --parallel=3`,
    {
      cwd: process.cwd(),
      stdio: 'inherit',
    }
  );



  const publishStatus = await releasePublish({
    dryRun: options.dryRun,
    verbose: options.verbose,
  });

  process.exit(publishStatus);
}
