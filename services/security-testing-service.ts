
/**
 * @file This file defines the SecurityTestingService, which provides a client
 * for the whitehat penetration testing API.
 *
 * @see /pages/api/v1/security/penetration-test.ts
 */

import axios from 'axios';

const API_URL = '/api/v1/security/penetration-test';

class SecurityTestingService {

  /**
   * Runs the penetration tests and returns the results.
   *
   * @returns A promise that resolves with the results of the penetration tests.
   */
  async runTests(): Promise<any> {
    try {
      const response = await axios.post(API_URL);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from the server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(error.message);
      }
    }
  }
}

export const securityTestingService = new SecurityTestingService();
