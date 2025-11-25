import { useState, useEffect } from 'react';

export default function TwoGOptimizedIDE() {
  const [code, setCode] = useState('');
  const [connection, setConnection] = useState<'2g' | '3g' | '4g'>('2g');

  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      setConnection(conn.effectiveType);
      conn.addEventListener('change', () => setConnection(conn.effectiveType));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    
    // Debounced sync for 2G
    if (connection === '2g') {
      setTimeout(() => {
        localStorage.setItem('code', e.target.value);
      }, 2000);
    } else {
      localStorage.setItem('code', e.target.value);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'monospace' }}>
      <div style={{ padding: 8, background: '#000', color: '#0f0', fontSize: 12 }}>
        📶 {connection.toUpperCase()} | {code.length} chars
      </div>
      <textarea
        value={code}
        onChange={handleChange}
        style={{
          flex: 1,
          background: '#1e1e1e',
          color: '#d4d4d4',
          border: 'none',
          padding: 12,
          fontSize: 14,
          fontFamily: 'monospace',
          resize: 'none'
        }}
        placeholder="// Optimized for 2G networks"
        spellCheck={false}
      />
      <div style={{ padding: 8, background: '#000', color: '#888', fontSize: 10 }}>
        Tap to code • Auto-save enabled
      </div>
    </div>
  );
}
