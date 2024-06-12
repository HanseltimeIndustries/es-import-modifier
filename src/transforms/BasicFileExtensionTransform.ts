import { extname } from 'path'
import { LocalImportTransform } from './types'

export interface BasicFileExtensionTransformOptions {
  // The extension we want to override to
  toExt: string
  // js extensions we expect in the import statements (defaults to .js)
  fromExts?: string[]
}

export class BasicFileExtensionTransform implements LocalImportTransform {
  readonly toExt: string
  readonly fromExts: string[]

  constructor(options: BasicFileExtensionTransformOptions) {
    if (!options.toExt.startsWith('.')) {
      throw new Error('localExt must start with .')
    }
    this.toExt = options.toExt
    this.fromExts = options.fromExts?.length ? options.fromExts : ['.js']
  }

  transform(value: string): string {
    const curExtension = extname(value)

    return `${value.substring(0, value.length - curExtension.length)}${this.toExt}`
  }

  isLocalFile(value: string): boolean {
    return (
      (value.startsWith('./') || value.startsWith('../')) &&
      this.fromExts.some((ext) => value.endsWith(ext))
    )
  }
}
