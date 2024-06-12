import { join } from "path"
import { FAKE_ESM_DIR, FAKE_SWAP_DIR, TEMP_DIR } from "../testUtils"
import { copy } from "fs-extra"
import { readdir, rm } from "fs/promises"
import { swapFileExts } from "./swapFileExts"

describe('swapFileExts', () => {
    const copyDir = join(TEMP_DIR, 'swapFileExts')
    beforeEach(async () => {
      await copy(FAKE_SWAP_DIR, copyDir)
    })
    afterEach(async () => {
      await rm(copyDir, { recursive: true, force: true })
    })
    it('swaps all matching file extensions to the correct extension', async () => {
        await swapFileExts(copyDir, {
            fromExt: '.js',
            toExt: '.cjs'
        })
        expect((await readdir(copyDir)).sort()).toEqual([
            'index.cjs',
            'nested',
            'thoughts.cjs',
        ])
        expect((await readdir(join(copyDir, 'nested'))).sort()).toEqual([
            'something.cjs',
            'something.else',
        ])
    })
    it('throws an error if fromExt does not start with .', async () => {
        await expect(async () => swapFileExts(copyDir, { fromExt: 'js', toExt: '.mjs' })).rejects.toThrow('extensions must start with .')
    })
    it('throws an error if toExt does not start with .', async () => {
        await expect(async () => swapFileExts(copyDir, { fromExt: '.js', toExt: 'cjs' })).rejects.toThrow('extensions must start with .')
    })
})