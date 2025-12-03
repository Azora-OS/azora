import React from 'react';

interface AzStudioProps {
  className?: string;
  code?: string;
  language?: string;
  onChange?: (val: any) => void;
}

export function AzStudio({ className, code, language, onChange }: AzStudioProps) {
  return (
    <div className={`w-full h-96 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center ${className || ''}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-400 mb-2">AzStudio</div>
        <div className="text-sm text-gray-500">AI-powered development environment</div>
        <div className="text-xs text-gray-600 mt-2">Feature coming soon</div>
        {code && (
          <div className="mt-4 text-xs text-gray-500">
            <div>Language: {language}</div>
            <div>Code length: {code.length} chars</div>
          </div>
        )}
      </div>
    </div>
  );
}
