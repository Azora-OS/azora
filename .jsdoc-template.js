/**
 * @module ModuleName
 * @description Brief description of the module
 */

/**
 * Function description
 * @param {string} param1 - Description of param1
 * @param {number} param2 - Description of param2
 * @returns {Promise<Object>} Description of return value
 * @throws {Error} When something goes wrong
 * @example
 * const result = await functionName('test', 123);
 */
export async function functionName(param1, param2) {
  // Implementation
}

/**
 * Class description
 * @class
 */
export class ClassName {
  /**
   * Constructor description
   * @param {Object} options - Configuration options
   * @param {string} options.name - Name property
   */
  constructor(options) {
    this.name = options.name;
  }

  /**
   * Method description
   * @returns {string} Description of return value
   */
  getName() {
    return this.name;
  }
}
