import { existsSync, statSync } from 'fs'
import { dirname, extname, join, relative } from 'path'
import { LocalImportTransform } from './types'

export interface FindFileTransformOptions {
  /** Specify the extensions of the files */
  expectedFileExt: string
  /** This the list of allowed extensions in an import (for instance where you've put .js/.ts).  Defaults to no extension or .js */
  allowedImportExtsToTransform?: string[]
  /** If set to false, this will skip the verification of the files that we are updating the import to  */
  skipFileVerify?: boolean
}

/**
 * This transform is for commonjs style imports like:
 *
 * import './my-value'
 *
 * Because there is no extension, this will look for either the appropriate
 * index.<extension> file or my-value.<extension> file and then provide that
 * transform.
 */
export class ToFileExtensionTransform implements LocalImportTransform {
  readonly expectedFileExt: string
  readonly allowedImportExtsToTransform: string[]

  constructor(options: FindFileTransformOptions) {
    if (!options.expectedFileExt.startsWith('.')) {
      throw new Error('expectedFileExt must start with .')
    }
    this.expectedFileExt = options.expectedFileExt
    this.allowedImportExtsToTransform = options.allowedImportExtsToTransform ?? ['.js']
  }

  transform(value: string, fromFile: string): string {
    const fileDir = dirname(fromFile)
    const transformed = this.tryGetFile(join(fileDir, value), value)
    if (!transformed) {
      throw new Error(`Could not find a suitable real file for: ${value}`)
    }

    const relPath = relative(fileDir, transformed)
    return relPath.startsWith('../') ? relPath : `./${relPath}`
  }

  isLocalFile(value: string): boolean {
    if (value.startsWith('./') || value.startsWith('../')) {
      const ext = extname(value)
      return ext === '' || this.allowedImportExtsToTransform.includes(ext)
    }
    return false
  }

  private tryGetFile(importPath: string, importValue: string): string | undefined {
    if (existsSync(importPath)) {
      // This is a directory
      const stats = statSync(importPath)
      if (stats.isDirectory()) {
        const expectedIndex = `index${this.expectedFileExt}`
        const indexPath = join(importPath, expectedIndex)
        if (!existsSync(indexPath)) {
          throw new Error(`Could not find ${importValue}/${expectedIndex}`)
        }
        return indexPath
      }
      return importPath
    }

    const expectedFile = `${importPath}${this.expectedFileExt}`
    if (!existsSync(expectedFile)) {
      return undefined
    }
    return expectedFile
  }
}
