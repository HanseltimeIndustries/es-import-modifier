import { join } from 'path'
import { FAKE_ESM_DIR, TEXT_FIXTURES_DIR } from '../testUtils'
import { transformImports } from '../transformImports'
import { esmImportResolveExtensions } from './esmImportResolveExtensions'

/* eslint-disable no-var */
var mockBasicFileExtensionTransform: jest.Mock
var mockToFileExtensionTransform: jest.Mock
/* eslint-enable no-var */
jest.mock('../transforms', () => {
  mockBasicFileExtensionTransform = jest.fn()
  mockToFileExtensionTransform = jest.fn()
  return {
    BasicFileExtensionTransform: mockBasicFileExtensionTransform,
    ToFileExtensionTransform: mockToFileExtensionTransform,
  }
})
jest.mock('../transformImports')

describe('esmImportResolveExtension', () => {
  const testBasicFileExtensionTransform = { id: 'mockBasicFileExtensionTransform' }
  const testToFileExtensionTransform = { id: 'mockNoFileExtensionTransform' }

  beforeEach(() => {
    jest.clearAllMocks()

    mockBasicFileExtensionTransform.mockReturnValue(testBasicFileExtensionTransform)
    mockToFileExtensionTransform.mockReturnValue(testToFileExtensionTransform)
  })
  it('auto detects the file extension of the files in the folder if not provided', async () => {
    await esmImportResolveExtensions({
      directory: FAKE_ESM_DIR,
      importsHaveJsExt: false,
    })
    expect(transformImports as jest.Mock).toHaveBeenCalledWith({
      dir: FAKE_ESM_DIR,
      jsExt: '.mjs',
      importModifyOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: testToFileExtensionTransform,
      },
    })
    expect(mockToFileExtensionTransform).toHaveBeenCalledWith({
      expectedFileExt: '.mjs',
    })
  })
  it('throws an error if ther are no \\..?js files in the base folder', async () => {
    await expect(
      async () =>
        await esmImportResolveExtensions({
          directory: TEXT_FIXTURES_DIR,
          importsHaveJsExt: false,
        }),
    ).rejects.toThrow('Could not auto-detect the js file extension in $directoy, no files found.')
  })
  it('throws an error if ther are multiple \\..?js files in the base folder', async () => {
    await expect(
      async () =>
        await esmImportResolveExtensions({
          directory: join(TEXT_FIXTURES_DIR, 'fakeMultipleExts'),
          importsHaveJsExt: false,
        }),
    ).rejects.toThrow(
      `Could not auto-detect the js file extension in ${join(
        TEXT_FIXTURES_DIR,
        'fakeMultipleExts',
      )}, found multiple: .js,.mjs`,
    )
  })
  it('trusts the extension specified by jsFileExtension', async () => {
    await esmImportResolveExtensions({
      directory: FAKE_ESM_DIR,
      importsHaveJsExt: false,
      jsFileExtension: '.thjs',
    })
    expect(transformImports as jest.Mock).toHaveBeenCalledWith({
      dir: FAKE_ESM_DIR,
      jsExt: '.thjs',
      importModifyOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: testToFileExtensionTransform,
      },
    })
    expect(mockToFileExtensionTransform).toHaveBeenCalledWith({
      expectedFileExt: '.thjs',
    })
  })
  // TODO: this feels like we should maybe be smarer about this long term
  it('trusts the extension specified by jsFileExtension and uses importsHaveJsExt', async () => {
    await esmImportResolveExtensions({
      directory: FAKE_ESM_DIR,
      importsHaveJsExt: false,
      jsFileExtension: '.thjs',
    })
    expect(transformImports as jest.Mock).toHaveBeenCalledWith({
      dir: FAKE_ESM_DIR,
      jsExt: '.thjs',
      importModifyOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        localImportTransform: testToFileExtensionTransform,
      },
    })
    expect(mockToFileExtensionTransform).toHaveBeenCalledWith({
      expectedFileExt: '.thjs',
    })
  })
})
