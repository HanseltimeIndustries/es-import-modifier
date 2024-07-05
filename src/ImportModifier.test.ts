import { join } from 'path'
import { rm, readFile } from 'fs/promises'
import { copy } from 'fs-extra'
import { ImportModifier } from './ImportModifier'
import { FAKE_ESM_DIR, TEMP_DIR } from './testUtils'
import { LocalImportTransform } from './transforms'

describe('ImportModifier', () => {
  describe('modifyToBuffer', () => {
    let mockTransform: LocalImportTransform
    beforeEach(() => {
      mockTransform = {
        isLocalFile: jest.fn(),
        transform: jest.fn(),
      }
    })
    it('throws an error if not initialized', async () => {
      const modifier = new ImportModifier(join(FAKE_ESM_DIR, 'index.mjs'), {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      await expect(async () => modifier.modifyToBuffer()).rejects.toThrow(
        'Must initialize ImportModifier before use',
      )
    })
    it('returns substitutions from the matching transform with exports', async () => {
      const modifier = new ImportModifier(join(FAKE_ESM_DIR, 'index.mjs'), {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      ;(mockTransform.isLocalFile as jest.Mock).mockReturnValue(true)
      ;(mockTransform.transform as jest.Mock).mockReturnValue('special-value')
      await modifier.init()
      expect((await modifier.modifyToBuffer()).toString()).toEqual(
        "export * from 'special-value'\n" + "export * from 'special-value'\n",
      )
    })
    it('returns substitutions from the matching transform with imports', async () => {
      const modifier = new ImportModifier(join(FAKE_ESM_DIR, 'nested', 'func1.mjs'), {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      // Mock it so that we only transform lodash
      ;(mockTransform.isLocalFile as jest.Mock).mockImplementation((value) => value === 'lodash')
      ;(mockTransform.transform as jest.Mock).mockReturnValue('special-value')
      await modifier.init()
      expect((await modifier.modifyToBuffer()).toString()).toEqual(
        "import { join } from 'path'\n" +
          "import * as _ from 'special-value'\n" +
          '\n' +
          'export function someFunction() {\n' +
          '  // use mjs somewhere else\n' +
          "  console.log(join(__dirname, 'wow.mjs'))\n" +
          '  console.log(JSON.stringify(_))\n' +
          '}\n',
      )
    })
  })
  describe('modifyToFile', () => {
    let mockTransform: LocalImportTransform
    const testCopyDir = join(TEMP_DIR, 'importModifyTest')
    beforeAll(async () => {
      await copy(FAKE_ESM_DIR, testCopyDir)
    })
    afterAll(async () => {
      await rm(testCopyDir, { recursive: true, force: true })
    })
    beforeEach(() => {
      mockTransform = {
        isLocalFile: jest.fn(),
        transform: jest.fn(),
      }
    })
    it('throws an error if not initialized', async () => {
      const modifier = new ImportModifier(join(testCopyDir, 'index.mjs'), {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      await expect(async () => modifier.modifyToFile()).rejects.toThrow(
        'Must initialize ImportModifier before use',
      )
    })
    it('returns substitutions from the matching transform with exports', async () => {
      const file = join(testCopyDir, 'index.mjs')
      const modifier = new ImportModifier(file, {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      ;(mockTransform.isLocalFile as jest.Mock).mockReturnValue(true)
      ;(mockTransform.transform as jest.Mock).mockReturnValue('special-value')
      await modifier.init()
      await modifier.modifyToFile()
      expect((await readFile(file)).toString()).toEqual(
        "export * from 'special-value'\n" + "export * from 'special-value'\n",
      )
    })
    it('returns substitutions from the matching transform with imports', async () => {
      const file = join(testCopyDir, 'nested', 'func1.mjs')
      const modifier = new ImportModifier(file, {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: mockTransform,
      })
      // Mock it so that we only transform lodash
      ;(mockTransform.isLocalFile as jest.Mock).mockImplementation((value) => value === 'lodash')
      ;(mockTransform.transform as jest.Mock).mockReturnValue('special-value')
      await modifier.init()
      await modifier.modifyToFile()
      expect((await readFile(file)).toString()).toEqual(
        "import { join } from 'path'\n" +
          "import * as _ from 'special-value'\n" +
          '\n' +
          'export function someFunction() {\n' +
          '  // use mjs somewhere else\n' +
          "  console.log(join(__dirname, 'wow.mjs'))\n" +
          '  console.log(JSON.stringify(_))\n' +
          '}\n',
      )
    })
  })
})
