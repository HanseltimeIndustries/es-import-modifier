import { program } from 'commander'
import { swapFileExts } from '../cmd/swapFileExts'

program
  .requiredOption(
    '--dir <directory>',
    'The directory (and sub directories) with files that we want to swap the extensions on',
  )
  .requiredOption('--from <ext>', 'The extension to search for in the directory and sub directory')
  .requiredOption(
    '--to <ext>',
    'The extension to swap those files to',
  )

program.parse()
const cliOpts = program.opts() as {
  dir: string
  to: string
  from: string
}

void swapFileExts(cliOpts.dir, {
  toExt: cliOpts.to,
  fromExt: cliOpts.from
})

