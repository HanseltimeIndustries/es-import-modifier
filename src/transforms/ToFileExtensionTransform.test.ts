import { join } from 'path'
import { FAKE_ESM_DIR } from '../testUtils'
import { ToFileExtensionTransform } from './ToFileExtensionTransform'

describe('NoExtensionTransform', () => {
  describe('isLocalFile', () => {
    const transform = new ToFileExtensionTransform({
      expectedFileExt: '.mjs',
    })

    expect(transform.isLocalFile('acorn')).toBe(false)
  })

  describe('isLocalFile', () => {
    const transform = new ToFileExtensionTransform({
      expectedFileExt: '.mjs',
    })

    it('says a node package is not local', () => {
      expect(transform.isLocalFile('acorn')).toBe(false)
    })
    it('says a scoped node package is not local', () => {
      expect(transform.isLocalFile('@aws-sdk/client-ssm')).toBe(false)
    })
    it('says a ./ prefixed package is local', () => {
      expect(transform.isLocalFile('./nested')).toBe(true)
    })
    it('says a ../ prefixed package is local', () => {
      expect(transform.isLocalFile('../nested')).toBe(true)
    })
  })

  describe('transform', () => {
    const transform = new ToFileExtensionTransform({
      expectedFileExt: '.mjs',
    })

    it('transforms a directory to index file', () => {
      expect(transform.transform('./nested', join(FAKE_ESM_DIR, 'index.mjs'))).toBe(
        './nested/index.mjs',
      )
    })
    it('transforms a file to its extension name url', () => {
      expect(transform.transform('./nested/func1', join(FAKE_ESM_DIR, 'index.mjs'))).toBe(
        './nested/func1.mjs',
      )
    })
    it('transforms a file that stats with ../ to its extension name url', () => {
      expect(transform.transform('../nested2', join(FAKE_ESM_DIR, 'nested', 'index.mjs'))).toBe(
        '../nested2/index.mjs',
      )
    })
    it('throws an error if there is no found file', () => {
      expect(() => transform.transform('./huh', join(FAKE_ESM_DIR, 'nested', 'index.mjs'))).toThrow(
        'Could not find a suitable real file for: ./huh',
      )
    })
    it('throws an error if there is no index file in a directory', () => {
      expect(() =>
        transform.transform('../nonIndex', join(FAKE_ESM_DIR, 'nested', 'index.mjs')),
      ).toThrow('Could not find ../nonIndex/index.mjs')
    })
  })
})
