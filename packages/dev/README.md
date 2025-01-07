# @polkadot/dev

A collection of shared CI scripts and development environment (configuration, dependencies) used by [@polkadot](https://polkadot.js.org) projects.

# Scripts

## polkadot-ci-ghact-build

**Summary**:  
This script automates the continuous integration (CI) process for building, testing, versioning, and publishing packages in the repository. It handles tasks like cleaning the workspace, running tests, updating versions, publishing to npm, GitHub repositories, and Deno, and generating changelogs.

### CLI Arguments

- **`--skip-beta`**:  
  Prevents incrementing the version to a beta release.

### Usage

```bash
yarn polkadot-ci-ghact-build [options]
```

## polkadot-ci-ghact-docs

**Summary**:  
This script generates documentation for the repository and deploys it to GitHub Pages. It ensures the documentation is built and published with the correct configuration.

### CLI Arguments

This script does not accept any CLI arguments.

### Usage

```bash
yarn polkadot-ci-ghact-docs
```

## polkadot-ci-ghpages-force

**Summary**:  
This script force-refreshes the `gh-pages` branch of the repository by creating a new orphan branch, resetting its contents, and pushing it to GitHub. It ensures a clean state for GitHub Pages deployment.

### CLI Arguments

This script does not accept any CLI arguments.

### Usage

```bash
yarn polkadot-ci-ghpages-force
```

## polkadot-dev-build-docs

**Summary**:  
This script prepares the documentation for building by copying the `docs` directory to a `build-docs` directory. If the `build-docs` directory already exists, it is cleared before copying.

### CLI Arguments

This script does not accept any CLI arguments.

### Usage

```bash
yarn polkadot-dev-build-docs
```

## polkadot-dev-build-ts

**Summary**:  
This script compiles TypeScript source files into JavaScript outputs using the specified compiler (`tsc`), prepares the build artifacts, rewrites imports for compatibility (e.g., for Deno), lints dependencies, and updates package metadata for distribution. It supports CommonJS, ESM, and Deno outputs, along with configuration validation and export mapping.

### CLI Arguments

- **`--compiler <type>`**: Specifies the compiler to use for TypeScript compilation.  
  - Acceptable values: `tsc`  
  - Default: `tsc`

### Usage

```bash
yarn polkadot-dev-build-ts [options]
```

## polkadot-dev-circular

**Summary**:  
This script checks the project for circular dependencies in TypeScript (`.ts`, `.tsx`) files using the `madge` library. It reports any detected circular dependencies and exits with an error if any are found.

### CLI Arguments

This script does not accept any CLI arguments.

```bash
yarn polkadot-dev-circular
```

## polkadot-dev-clean-build

**Summary**:  
This script removes build artifacts and temporary files from the repository. It targets directories like `build` and files such as `tsconfig.*.tsbuildinfo`, ensuring a clean workspace for fresh builds.

### CLI Arguments

This script does not accept any CLI arguments.

```bash
yarn polkadot-dev-clean-build
```

## polkadot-dev-contrib

**Summary**:  
This script generates a `CONTRIBUTORS` file by aggregating and listing all contributors to the repository based on the Git commit history. It excludes bot accounts and service-related commits (e.g., GitHub Actions, Travis CI). The output includes the number of contributions, contributor names, and their most recent commit hash.

### CLI Arguments

This script does not accept any CLI arguments.

```bash
yarn polkadot-dev-contrib
```

## polkadot-dev-copy-dir

**Summary**:  
This script copies directories from specified source paths to a destination path. It supports options to change the working directory and to flatten the directory structure during copying.

### CLI Arguments

- **`--cd <path>`**:  
  Specifies a working directory to prepend to the source and destination paths.

- **`--flatten`**:  
  Copies all files directly to the destination without preserving the source directory structure.

### Usage

```bash
yarn polkadot-dev-copy-dir [options] <source>... <destination>
```
- `<source>`: One or more source directories to copy.
- `<destination>`: Destination directory for the copied files.

## polkadot-dev-copy-to

**Summary**:  
This script copies the `build` output and `node_modules` of all packages in the repository to a specified destination directory. It ensures the destination `node_modules` folder exists and is up-to-date.

### CLI Arguments

- **`<destination>`**:  
  Specifies the target directory where the `node_modules` folder resides.  

### Usage

```bash
yarn polkadot-dev-copy-to <destination>
```

## polkadot-dev-deno-map

**Summary**:  
This script generates a `mod.ts` file and an `import_map.json` file for Deno compatibility. It exports all packages with a `mod.ts` file in their `src` directory and maps their paths for use in Deno.

### Outputs

- **`mod.ts`**:  
  An auto-generated TypeScript module exporting all packages for Deno. If the file does not exist, it is created.

- **`import_map.json`**:  
  A JSON file mapping package paths to their corresponding Deno-compatible build paths. If an `import_map.in.json` file exists, its mappings are merged into the output.

### CLI Arguments

This script does not accept any CLI arguments.

## polkadot-dev-run-lint

**Summary**:  
This script runs linting and TypeScript checks on the repository. It uses `eslint` for code linting and `tsc` for TypeScript type checking. Specific checks can be skipped using CLI arguments.

### CLI Arguments

- **`--skip-eslint`**:  
  Skips running `eslint` during the linting process.  

- **`--skip-tsc`**:  
  Skips running the TypeScript (`tsc`) type checker.  

### Usage

```bash
yarn polkadot-dev-run-lint [options]
```

## polkadot-dev-run-node-ts

**Summary**:  
This script executes a Node.js script with TypeScript support, using the `@polkadot/dev-ts/cached` loader by default. It dynamically handles global and local loaders and allows for additional Node.js flags to be passed.

### CLI Arguments

- `<script>`: The TypeScript file to execute.
- `[args...]`: Arguments to pass to the executed script.
- Node.js flags, such as `--require`, `--loader`, and `--import`, are also supported and processed as follows:
  - **Global loaders** (e.g., absolute or non-relative paths) are prioritized.
  - The TypeScript loader is inserted after global loaders.
  - **Local loaders** (e.g., relative paths starting with `.`) are appended last.

### Default Behavior

- Suppresses warnings using the `--no-warnings` flag.
- Enables source maps with `--enable-source-maps`.
- Uses the `@polkadot/dev-ts/cached` loader for TypeScript execution.

### Usage

```bash
yarn polkadot-dev-run-node-ts <script> [nodeFlags...] [args...]
```

Notes:

- The execNodeTs function ensures correct ordering of loaders:
1. Global loaders are added first.
2. The default TypeScript loader is included.
3. Local loaders are appended.
- Global and local loaders can be mixed for flexible runtime configurations.

## polkadot-dev-run-test

**Summary**:  
This script runs test files in the repository, filtering by file extensions and optional path-based filters. It supports both Node.js and browser environments, custom flags, and development-specific configurations.

### CLI Arguments

- **`--dev-build`**:  
  Enables development mode, using local development builds for dependencies and loaders.

- **`--env <environment>`**:  
  Specifies the test environment.  
  - Acceptable values: `node`, `browser`  
  - Default: `node`

- **`--bail`**:  
  Stops the test suite on the first failure.

- **`--console`**:  
  Enables console output during tests.

- **`--logfile <file>`**:  
  Specifies a log file to capture test output.

- **`--import <module>`**:  
  Imports the specified module.

- **`--loader <loader>`**:  
  Specifies a custom Node.js loader.

- **`--require <module>`**:  
  Preloads the specified module.

- **Filters**:  
  You can include or exclude specific test files by specifying path-based filters:  
  - Include: `filter` (e.g., `utils`)  
  - Exclude: `^filter` (e.g., `^utils`)  

### Supported Test Files

The script searches for test files with the following extensions:  
- **File Types**: `.spec`, `.test`  
- **Languages**: `.ts`, `.tsx`, `.js`, `.jsx`, `.cjs`, `.mjs`  

### Usage

```bash
yarn polkadot-dev-run-test [options] [filters...]
```

### Behavior

- **Filters:**
Filters are applied to include or exclude test files based on their paths. Included filters take precedence, and excluded filters are applied afterward.

- **Execution:**
The script dynamically loads the appropriate environment setup (node or browser) and runs the tests using @polkadot/dev-test.

- **Errors:**
If no matching files are found, the script exits with a fatal error.

- **Development Mode:**
In development mode, local build paths are used for test and TypeScript loaders.

## polkadot-dev-version

**Summary**:  
This script automates the version bump process for a package or a monorepo. It updates the `version` field in `package.json` files and synchronizes dependency versions across workspaces. It supports major, minor, patch, and pre-release version bumps.

### CLI Arguments

- `<type>`: The type of version bump to apply.
  - Acceptable values: `major`, `minor`, `patch`, `pre`
  - Required.

### Behavior

1. **Version Bump**:
   - Uses `yarn version` to bump the root package version based on the specified `<type>`.

2. **Synchronizes Dependencies**:
   - Updates all `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`, and `resolutions` across all workspace packages to match the new version where applicable.

3. **Handles `-x` Suffix**:
   - If the root package's version ends with `-x`, it is temporarily removed before the version bump and re-added afterward for pre-releases.

4. **Updates Workspaces**:
   - Loops through all `packages/*` directories to update their `package.json` files with the new version and aligned dependencies.

5. **Installs Updated Dependencies**:
   - Runs `yarn install` to apply dependency updates after bumping versions.

### Usage

```bash
yarn polkadot-dev-version <type>
```

## polkadot-dev-yarn-only


**Summary**:  
This script ensures that `yarn` is being used as the package manager. It exits with an error if a different package manager (e.g., `npm`) is detected.

### Behavior

1. **Check for Yarn**:
   - Verifies that the `yarn` package manager is being used by inspecting the `npm_execpath` environment variable.

2. **Exit on Failure**:
   - If `yarn` is not detected, the script exits with a fatal error message explaining that `yarn` is required.

### Usage

```bash
yarn polkadot-dev-yarn-only
```

## polkadot-exec-eslint

**Summary**:  
This script runs the ESLint binary to lint JavaScript and TypeScript files in the project. It uses the ESLint installation local to the project.

### Behavior

1. **Import ESLint**:
   - Dynamically imports and executes the `eslint` binary from the local project's `node_modules`.

2. **Delegates to ESLint**:
   - The script acts as a wrapper around the `eslint` command, passing any arguments to it.

### Usage

```bash
yarn polkadot-exec-eslint [eslint-arguments]
```

Notes
- This script ensures that the locally installed version of ESLint is used, avoiding conflicts with global installations.
- All standard ESLint CLI options can be passed directly to the script.

## polkadot-exec-ghpages

**Summary**:  
This script acts as a wrapper for the `gh-pages` tool, which is used to publish content to a project's GitHub Pages branch.

### Behavior

1. **Import `gh-pages`**:
   - Dynamically imports the `gh-pages` binary from the local project's `node_modules`.

2. **Run `gh-pages`**:
   - Passes command-line arguments directly to the `gh-pages` tool to execute the desired publishing tasks.

3. **Output on Success**:
   - Logs `Published` to the console upon successful completion.

### Usage

```bash
yarn polkadot-exec-ghpages [gh-pages-arguments]
```

## polkadot-exec-ghrelease

**Summary**:  
This script is a wrapper for the `gh-release` tool, used to create GitHub releases directly from the command line.

### Behavior

1. **Import `gh-release`**:
   - Dynamically imports the `gh-release` binary from the local project's `node_modules`.

2. **Run `gh-release`**:
   - Executes the `gh-release` CLI with any provided arguments.

### Usage

```bash
yarn polkadot-exec-ghrelease [gh-release-arguments]
```

## polkadot-exec-node-test

**Summary**:  
This script is designed to execute Node.js tests using the `node:test` module. It includes support for diagnostic reporting, customizable logging, and execution controls like bail and timeout.

### Key Features:

1. **Custom Test Execution**:
   - Executes tests using the `node:test` framework.
   - Handles test results, diagnostic messages, and statistics.

2. **Real-time Feedback**:
   - Displays progress updates on the console with formatted outputs:
     - `·` for passed tests.
     - `x` for failed tests.
     - `>` for skipped tests.
     - `!` for todo tests.

3. **Logging and Debugging**:
   - Optionally logs errors to a specified file (`--logfile <filename>`).
   - Outputs detailed diagnostic information when `--console` is used.

4. **Command-line Options**:
   - `--bail`: Stops execution after the first test failure.
   - `--console`: Outputs diagnostic and error details to the console.
   - `--logfile <file>`: Appends error logs to the specified file.

5. **Error Reporting**:
   - Provides structured error output, including filenames, stack traces, and failure types.

6. **Timeout**:
   - Configures a default timeout of 1 hour to avoid indefinite hangs.

### CLI Options:

- `--bail`: Exit after the first test failure.
- `--console`: Print diagnostic details to the console.
- `--logfile <file>`: Write failure details to the specified log file.
- `<files>`: Specify test files to run (supports glob patterns).

### Usage:

```bash
yarn polkadot-exec-node-test [options] <files...>
```

## polkadot-exec-rollup

**Summary**:  
This script serves as a wrapper for the Rollup CLI, allowing users to execute Rollup commands via Node.js. It simplifies access to the Rollup binary and forwards all provided arguments directly to the Rollup CLI.

### CLI Arguments

- **`--config <file>`**:  
  Specifies the Rollup configuration file to use.

- **`--watch`**:  
  Enables watch mode, automatically rebuilding the bundle on file changes.

- **`--input <file>`**:  
  Specifies the input file for the build.

- **`--output <file>`**:  
  Specifies the output file or directory for the build.

- **`--silent`**:  
  Suppresses Rollup output logs.

Refer to the [Rollup CLI documentation](https://rollupjs.org/guide/en/#command-line-interface) for a full list of available options.

### Usage

```bash
yarn polkadot-exec-rollup [options]
```

## polkadot-exec-tsc

**Summary**:  
This script executes the TypeScript Compiler (TSC) directly by importing the TypeScript library, enabling developers to compile TypeScript files with the same options available in the native `tsc` CLI.

### Common Options  

- **`--project <file>`**  
  Use a specific `tsconfig.json` file for compilation.

- **`--watch`**  
  Watch for file changes and recompile automatically.

- **`--outDir <directory>`**  
  Specify an output directory for compiled files.

- **`--declaration`**  
  Generate TypeScript declaration files (`.d.ts`).

- **`--strict`**  
  Enable strict type-checking options.

Refer to the official [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig) for a complete list of supported options.

### CLI Usage  

```bash
yarn polkadot-exec-tsc [options]
```

##

**Summary**:  
This script directly imports and executes the Webpack CLI, allowing developers to bundle JavaScript applications using Webpack with access to all CLI options provided by the `webpack-cli`.

## Common Options  

- **`--config <path>`**  
  Specify a path to the Webpack configuration file.

- **`--mode <mode>`**  
  Set the mode for Webpack. Valid values are `development`, `production`, or `none`.

- **`--watch`**  
  Watch files for changes and rebuild the bundle automatically.

- **`--entry <file>`**  
  Specify the entry file for the application.

- **`--output <path>`**  
  Set the directory or filename for the output bundle.

Refer to the official [Webpack CLI Options](https://webpack.js.org/api/cli/) for a complete list of supported options.

## CLI Usage  

```bash
yarn polkadot-exec-webpack [options]
```