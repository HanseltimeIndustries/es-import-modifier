import { statSync } from "fs"
import { readdir, rename } from "fs/promises"
import { join } from "path"

export interface TransformFileExtsOptions {
    /** The extension we want to convert */
    fromExt: string
    /** The extension we convert to */
    toExt: string
}

export async function swapFileExts(currentDir: string, opts: TransformFileExtsOptions) {
    if (!opts.fromExt.startsWith('.') || !opts.toExt.startsWith('.')) {
        throw new Error('extensions must start with .')
    }

    const paths = await readdir(currentDir)
    await Promise.all(
      paths.map(async (path) => {
        const abs = join(currentDir, path)
        if (statSync(abs).isDirectory()) {
          return swapFileExts(abs, opts)
        }
  
        if (path.endsWith(opts.fromExt)) {
            rename(abs, abs.substring(0, abs.lastIndexOf('.')) + opts.toExt)
        }
      }),
    )
}