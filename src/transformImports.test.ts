import { join } from 'path'
import { readFile, rm } from 'fs/promises'
import { copy } from 'fs-extra'
import { FAKE_ESM_DIR, TEMP_DIR } from './testUtils'
import { transformImports } from './transformImports'
import { ToFileExtensionTransform } from './transforms'

describe('transformImports', () => {
  const copyDir = join(TEMP_DIR, 'transformImports')
  beforeEach(async () => {
    await copy(FAKE_ESM_DIR, copyDir)
  })
  afterEach(async () => {
    await rm(copyDir, { recursive: true, force: true })
  })
  it('transforms all files that match extension', async () => {
    await transformImports({
      dir: copyDir,
      jsExt: '.mjs',
      importModifyOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: new ToFileExtensionTransform({
          expectedFileExt: '.mjs',
        }),
      },
    })

    // Ensure the file changes
    expect((await readFile(join(copyDir, 'index.mjs'))).toString()).toEqual(
      "export * from './nested/index.mjs'\n" + "export * from './nested2/index.mjs'\n",
    )
    expect((await readFile(join(copyDir, 'someScript.mjs'))).toString()).toEqual(
      "import { someFunction2 } from './nested2/index.mjs'\n" + '\n' + 'someFunction2()\n',
    )

    expect((await readFile(join(copyDir, 'nested', 'index.mjs'))).toString()).toEqual(
      "export * from './func1.mjs'\n",
    )
    expect((await readFile(join(copyDir, 'nested', 'func1.mjs'))).toString()).toEqual(
      "import { join } from 'path'\n" +
        "import * as _ from 'lodash'\n" +
        '\n' +
        'export function someFunction() {\n' +
        '  // use mjs somewhere else\n' +
        "  console.log(join(__dirname, 'wow.mjs'))\n" +
        '  console.log(JSON.stringify(_))\n' +
        '}\n',
    )

    expect((await readFile(join(copyDir, 'nested2', 'index.mjs'))).toString()).toEqual(
      "export * from './func2.mjs'\n",
    )
    expect((await readFile(join(copyDir, 'nested2', 'func2.mjs'))).toString()).toEqual(
      "import { join } from 'path'\n" +
        "import * as _ from 'lodash'\n" +
        '\n' +
        'export function someFunction2() {\n' +
        '  // use mjs somewhere else\n' +
        "  console.log(join(__dirname, 'wow2.mjs'))\n" +
        '  console.log(JSON.stringify(_))\n' +
        '}\n',
    )

    expect((await readFile(join(copyDir, 'nonIndex', 'foo.mjs'))).toString()).toEqual(
      "export const HERE = 'here'\n",
    )
  })
})
