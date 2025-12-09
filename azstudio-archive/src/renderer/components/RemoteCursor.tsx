import React from 'react';

interface RemoteCursorProps {
    userId: string;
    position: { lineNumber: number; column: number };
    color: string;
    label?: string;
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ userId, position, color, label }) => {
  return (
    <div
      className="remote-cursor"
      style={{
        position: 'absolute',
        top: `${(position.lineNumber - 1) * 19}px`, // Approx line height
        left: `${(position.column - 1) * 8}px`, // Approx char width
        borderLeft: `2px solid ${color}`,
        height: '19px',
        pointerEvents: 'none'
      }}
      title={`User: ${userId}`}
    >
        {label && <span style={{ backgroundColor: color, fontSize: '10px' }}>{label}</span>}
    </div>
  );
};

export default RemoteCursor;
