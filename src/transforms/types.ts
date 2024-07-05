/**
 * Simple class for implementing transforms on import values
 */
export interface LocalImportTransform {
  /**
   * Guarantees you will only get this called for values that return true for islocalFile
   *
   * @param {string} value the import file string
   * @param {string} fromFile the file path that this value was being imported in
   * @returns {string} the transformed import
   */
  transform(value: string, fromFile: string): string

  /**
   * Used to determine is a file should be transformed
   *
   * @param {string} value the import file string
   * @param {string} fromFile the file path that this value was being imported in
   * @returns {boolean} true if the file is local and should be modified
   */
  isLocalFile(value: string, fromFile: string): boolean
}
