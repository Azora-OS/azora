import React from 'react';

interface Action {
  label: string;
  command: string;
}

interface MessageProps {
  content: string;
  type?: 'markdown' | 'code' | 'plain';
  language?: string;
  actions?: Action[];
}

export function RichMessage({ content, type = 'plain', language, actions }: MessageProps) {
  const renderContent = () => {
    if (type === 'code') {
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
          <code className={`language-${language || 'text'}`}>{content}</code>
        </pre>
      );
    }

    if (type === 'markdown') {
      return (
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      );
    }

    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  const handleAction = async (command: string) => {
    try {
      await fetch('http://localhost:4002/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'ui', payload: { command } })
      });
    } catch {}
  };

  return (
    <div className="border rounded p-4 mb-4">
      {renderContent()}
      {actions && actions.length > 0 && (
        <div className="mt-4 flex gap-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action.command)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
