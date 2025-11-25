/**
 * RemoteCursor
 * 
 * Component to display remote user cursors in the Monaco editor
 */

import React from 'react';

export interface RemoteCursorProps {
  userId: string;
  userName: string;
  color: string;
  position: { line: number; column: number };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export const RemoteCursor: React.FC<RemoteCursorProps> = ({
  userId,
  userName,
  color,
  position,
  selection
}) => {
  return (
    <>
      {/* Cursor */}
      <div
        className="remote-cursor"
        style={{
          backgroundColor: color,
          left: `${position.column * 7.2}px`, // Approximate character width
          top: `${position.line * 19}px` // Approximate line height
        }}
      >
        <div
          className="remote-cursor-label"
          style={{ backgroundColor: color }}
        >
          {userName}
        </div>
      </div>

      {/* Selection */}
      {selection && (
        <div
          className="remote-selection"
          style={{
            backgroundColor: color,
            left: `${selection.start.column * 7.2}px`,
            top: `${selection.start.line * 19}px`,
            width: `${(selection.end.column - selection.start.column) * 7.2}px`,
            height: `${(selection.end.line - selection.start.line + 1) * 19}px`
          }}
        />
      )}
    </>
  );
};

export default RemoteCursor;
