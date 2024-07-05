import { extname } from 'path'
import { readdir } from 'fs-extra'
import { transformImports } from '../transformImports'
import { BasicFileExtensionTransform, ToFileExtensionTransform } from '../transforms'

interface EsImportModifyOptions {
  /** The directory to apply import modification into */
  directory: string
  /** The file extension for js files in the repo.  If not specified, the script looks for the top level \..?js file  */
  jsFileExtension?: string
  /** If the imports we're modifying have .js already added */
  importsHaveJsExt: boolean
}

/**
 * A simple command that will modify any imports in javascript files of a certain
 * extension in a directory and then update those imports to have the correct
 * file resolution.
 *
 * The use for this type of command is when you are dual compiling esm and commonjs
 * and have an esm folder.  It is advantageous to write all your files to .mjs so
 * that node does not complain when pulling them in for esm projects and you do not
 * have to set `type: module` (which will cause problems with loading this in commonjs projects).
 *
 * Since ESM requires import resolution to fully qualified file names, you can then run
 * this against the esm/ directory AFTER you have ensured that all files have been changed to .mjs.
 *
 * bash command to change all extensions:
 *
 * `find ./dist/esm/ -type f -name "*.js" -exec sh -c 'mv "$0" "${0%.js}.mjs"' {} \;`
 *
 * Running this command after would then recognize that there's .mjs files and would update all imports
 * to be resolved to .mjs
 *
 * @param options
 */
export async function esmImportResolveExtensions(options: EsImportModifyOptions) {
  const jsFileExtension = options.jsFileExtension
    ? options.jsFileExtension
    : await autoDetectFileType(options.directory)

  await transformImports({
    dir: options.directory,
    jsExt: jsFileExtension,
    importModifyOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
      localImportTransform: options.importsHaveJsExt
        ? new BasicFileExtensionTransform({
            toExt: jsFileExtension,
            fromExts: ['.js'],
          })
        : new ToFileExtensionTransform({
            expectedFileExt: jsFileExtension,
          }),
    },
  })
}

async function autoDetectFileType(directory: string) {
  const files = await readdir(directory)
  const extensions = files.reduce((s, file) => {
    const ext = extname(file)
    if (ext.endsWith('js')) {
      s.add(ext)
    }
    return s
  }, new Set<string>())

  if (extensions.size > 1) {
    throw new Error(
      `Could not auto-detect the js file extension in ${directory}, found multiple: ${Array.from(
        extensions.values(),
      ).join(',')}`,
    )
  }
  if (extensions.size === 0) {
    throw new Error('Could not auto-detect the js file extension in $directoy, no files found.')
  }
  return extensions.keys().next().value
}
