/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * @file This file defines a UI component for running whitehat penetration tests.
 * This component provides a simple interface for enterprise customers to test the security of their systems.
 */

import { useState } from 'react';
import { securityTestingService } from '@/services/security-testing-service';

const PenetrationTester = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunTests = async () => {
    setLoading(true);
    const results = await securityTestingService.runTests();
    setResults(results);
    setLoading(false);
  };

  return (
    <div>
      <h2>Whitehat Security Testing</h2>
      <p>Click the button below to run a suite of penetration tests against the system.</p>
      <button onClick={handleRunTests} disabled={loading}>
        {loading ? 'Running Tests...' : 'Run Penetration Tests'}
      </button>
      {results && (
        <div>
          <h3>Test Results</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PenetrationTester;

