# es-import-modifier

Have you tried to support both commonjs and ES Modules in your package publishing and ran into
the rather painful problem of having to have the correct file extension on your imports?

You're in good company if you have!  This has been a continual request of the typescript project
[since 2017](https://github.com/microsoft/TypeScript/issues/16577).  Note, the typescript team 
does not want to get into the business of code modification for this sake, so they have made the
decision to not support that.  That's what this is for!  I'll roll those dice!

This library uses the well-tested acorn.js parser to identify and only modify import statements.

- [es-import-modifier](#es-import-modifier)
- [Usage](#usage)
  - [Installation](#installation)
  - [Example Repo structure](#example-repo-structure)
  - [Bin script](#bin-script)
    - [esm-import-resolve-extensions](#esm-import-resolve-extensions)
    - [swap-file-exts](#swap-file-exts)
- [Programmatic API](#programmatic-api)

  
*Table of Contents generated with VSCode Markdown All In One extension*

# Usage

## Installation

```shell
yarn add --dev @hansetime/es-import-modifier
npm install --save-dev @hanseltime/es-import-modifier
```

## Example Repo structure

This repo uses itself to publish compliant common and esm dual libraries (please raise any issues if you find a 
resolution system that does not work with this).

In order to do that, we set up separate tsconfig modules for:

1. Local running/development [tsconfig.json](./tsconfig.json)
2. commonjs module resolution [tsconfig.cjs.json](./tsconfig.cjs.json)
3. esm module resolution [tsconfig.esm.jsom](./tsconfig.esm.json)
4. types declarations [tsconfig.types.json](./tsconfig.types.json)

Out Package json then has a script for each:

```json
{
  "name": "@hanseltime/es-import-modifier",
  "description": "A package that provides methods for updating commonjs imports to esm syntax",
  "repository": {
    "type": "git",
    "url": "https://github.com/HanseltimeIndustries/es-import-modifier.git"
  },
  "types": "./dist/types/index.d.ts",
  "main": "./dist/cjs/index.js",
  "exports": {
    "types": "./dist/types/index.d.ts",
    "require": "./dist/cjs/index.js",
    "import": "./dist/esm/index.mjs",
    "default": "./dist/esm/index.js"
  },
  "files": [
    "dist",
  ],
  "scripts": {
    "build:cjs": "tsc -p tsconfig.cjs.json ",
    "build:esm": "tsc -p tsconfig.esm.json && yarn swap-file-exts --dir dist/esm --from .js --to .mjs && yarn esm-import-resolve-extensions --dir dist/esm --ext .mjs",
    "build:types": "tsc -p tsconfig.types.json",
    "build": "yarn build:cjs && yarn build:esm && yarn build:types",
  },
  "version": "1.0.0",
}
```

From the above, you can see that only the `build:esm` command is set up to change esm files to .mjs extensions and then to add
a .mjs extension in all imports.  This if the repo's preferred way to set things up because we can use extensionless imports
in our development (using commonjs resolutions) and then append them later.  It leads to less confusion with other tools.

In general, you can call `yarn build` and then whatever release pipeline you have configured to package the npm package.


## Bin script

This package provides two bin scripts that you can use to in your build scripts or pipeline.  It is recommended that you use
them to modify your esm build files (see above)

### esm-import-resolve-extensions

This command will scan all nested directories for any files with the extension that you provide, parse the corresponding .js,
and then update any imports to their resolved paths with extensions (including bucket files that need index.\<ext>).

If you have already added .js in your code to every import, you will be asked to add `--imports-have-js`.

### swap-file-exts

This one is almost a throw away.  It's provided for completeness.  This just scans all files within a folder and its subfolders
and then changes the files to have the new extension.  

This is valuable if you are trying to rename your esm module to use the .mjs files since some resolution schemes don't do well
with .js files.

# Programmatic API

We do provide a programmatic API for you to do your own scans if you find it valuable to use something that will do modification
to import statements.  Please take a look at the commands to understand how we orchestrate them.

