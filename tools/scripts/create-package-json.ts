import {
  createProjectGraphAsync,
  readCachedProjectGraph,
  detectPackageManager,
} from '@nx/devkit';
import { createLockFile, createPackageJson, getLockFileName } from '@nx/js';
import { format } from 'prettier';
import { writeFileSync } from 'fs';

function invariant(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

async function main() {
  const pm = detectPackageManager();

  let projectGraph = readCachedProjectGraph();

  if (!projectGraph) {
    projectGraph = await createProjectGraphAsync();
  }

  const projectName = process.env.NX_TASK_TARGET_PROJECT,
    project = projectGraph.nodes[projectName];

  invariant(
    project,
    `Could not find project "${projectName}" in the workspace. Is the project.json configured correctly?`
  );

  const outputPath = project.data?.targets?.build?.options?.outputPath;

  invariant(
    outputPath,
    `Could not find "build.options.outputPath" of project "${projectName}". Is project.json configured  correctly?`
  );

  const packageJson = createPackageJson(projectName, projectGraph, {
      isProduction: true,
    }),
    lockFile = createLockFile(
      packageJson,
      projectGraph,
      detectPackageManager()
    ),
    lockFileName = getLockFileName(pm);

  writeFileSync(
    `${outputPath}/package.json`,
    format(JSON.stringify(packageJson), { parser: 'json' })
  );
  writeFileSync(`${outputPath}/${lockFileName}`, lockFile, {
    encoding: 'utf8',
  });
}

main();
