import { BasicFileExtensionTransform } from './BasicFileExtensionTransform'

describe('BasicFileExtensionTransform', () => {
  describe('isLocalFile', () => {
    const transform = new BasicFileExtensionTransform({
      toExt: '.mjs',
    })
    it('returns local file if the file starts with ./', () => {
      expect(transform.isLocalFile('./something.js')).toBe(true)
    })
    it('returns local file if the file starts with ../', () => {
      expect(transform.isLocalFile('../something.js')).toBe(true)
    })
    it('returns false when a package is used', () => {
      expect(transform.isLocalFile('lodash')).toBe(false)
    })
    it('returns false when a scoped package is used', () => {
      expect(transform.isLocalFile('@aws-sdk/ssm-client')).toBe(false)
    })
  })
})
