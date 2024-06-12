import { program } from 'commander'
import { esmImportResolveExtensions } from '../cmd/esmImportResolveExtensions'

program
  .requiredOption(
    '--dir <directory>',
    'The directory with esm files that we want to make sure are resolved',
  )
  .option('--imports-have-js', 'The imports in this directory have .js already')
  .option(
    '--ext <ext>',
    'The file extension that the js files have - used to find files and resolve imports. If not specified, the command will attempt to auto-detect one',
  )

program.parse()
const cliOpts = program.opts() as {
  dir: string
  importsHaveJs?: boolean
  ext?: string
}

void esmImportResolveExtensions({
  directory: cliOpts.dir,
  importsHaveJsExt: !!cliOpts.importsHaveJs,
  jsFileExtension: cliOpts.ext,
})
