import { statSync } from 'fs'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { ImportModifier, ImportModifierOptions } from './ImportModifier'

export interface TransformImportsOptions {
  /** The directory that we will recurse through and modify */
  dir: string
  /** The extension of the .js files */
  jsExt: string
  /** The options for import modification of each file */
  importModifyOptions: ImportModifierOptions
}

export async function transformImports(options: TransformImportsOptions) {
  if (!options.jsExt.startsWith('.')) {
    throw new Error('jsExt extension must start with .')
  }
  await modifyPerDirectory(options.dir, options)
}

async function modifyPerDirectory(currentDir: string, opts: TransformImportsOptions) {
  const paths = await readdir(currentDir)
  await Promise.all(
    paths.map(async (path) => {
      const abs = join(currentDir, path)
      if (statSync(abs).isDirectory()) {
        return modifyPerDirectory(abs, opts)
      }

      if (path.endsWith(opts.jsExt)) {
        const modifier = new ImportModifier(abs, opts.importModifyOptions)
        await modifier.init()
        await modifier.modifyToFile()
      }
    }),
  )
}
