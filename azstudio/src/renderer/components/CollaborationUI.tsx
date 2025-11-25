import React, { useEffect, useState } from 'react';
import './CollaborationUI.css';

interface RemoteUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: { line: number; column: number };
  selection?: { start: { line: number; column: number }; end: { line: number; column: number } };
  activeFile?: string;
}

interface CollaborationUIProps {
  users: RemoteUser[];
  currentUserId: string;
  onUserClick?: (userId: string) => void;
}

export const CollaborationUI: React.FC<CollaborationUIProps> = ({
  users,
  currentUserId,
  onUserClick
}) => {
  const [activeUsers, setActiveUsers] = useState<RemoteUser[]>([]);

  useEffect(() => {
    // Filter out current user and update active users
    setActiveUsers(users.filter(user => user.id !== currentUserId));
  }, [users, currentUserId]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserClick = (userId: string) => {
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  return (
    <div className="collaboration-ui">
      <div className="collaboration-header">
        <h3>Active Users ({activeUsers.length})</h3>
      </div>
      
      <div className="collaboration-users-list">
        {activeUsers.length === 0 ? (
          <div className="no-users">
            <p>No other users online</p>
          </div>
        ) : (
          activeUsers.map(user => (
            <div
              key={user.id}
              className="collaboration-user"
              onClick={() => handleUserClick(user.id)}
              style={{ borderLeftColor: user.color }}
            >
              <div
                className="user-avatar"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{getInitials(user.name)}</span>
                )}
              </div>
              
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                {user.activeFile && (
                  <div className="user-file" title={user.activeFile}>
                    {user.activeFile.split('/').pop()}
                  </div>
                )}
                {user.cursor && (
                  <div className="user-position">
                    Line {user.cursor.line}, Col {user.cursor.column}
                  </div>
                )}
              </div>
              
              <div
                className="user-indicator"
                style={{ backgroundColor: user.color }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Remote cursor component for Monaco editor
interface RemoteCursorOverlayProps {
  users: RemoteUser[];
  editorRef: React.RefObject<any>;
}

export const RemoteCursorOverlay: React.FC<RemoteCursorOverlayProps> = ({
  users,
  editorRef
}) => {
  const [cursorPositions, setCursorPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const newPositions = new Map<string, { x: number; y: number }>();

    users.forEach(user => {
      if (user.cursor) {
        try {
          const position = editor.getScrolledVisiblePosition({
            lineNumber: user.cursor.line,
            column: user.cursor.column
          });
          
          if (position) {
            newPositions.set(user.id, {
              x: position.left,
              y: position.top
            });
          }
        } catch (error) {
          console.error('Error calculating cursor position:', error);
        }
      }
    });

    setCursorPositions(newPositions);
  }, [users, editorRef]);

  return (
    <div className="remote-cursors-overlay">
      {users.map(user => {
        const position = cursorPositions.get(user.id);
        if (!position || !user.cursor) return null;

        return (
          <div
            key={user.id}
            className="remote-cursor"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              borderColor: user.color
            }}
          >
            <div
              className="remote-cursor-flag"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Remote selection highlight component
interface RemoteSelectionHighlightProps {
  users: RemoteUser[];
  editorRef: React.RefObject<any>;
}

export const RemoteSelectionHighlight: React.FC<RemoteSelectionHighlightProps> = ({
  users,
  editorRef
}) => {
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const decorations: any[] = [];

    users.forEach(user => {
      if (user.selection) {
        decorations.push({
          range: {
            startLineNumber: user.selection.start.line,
            startColumn: user.selection.start.column,
            endLineNumber: user.selection.end.line,
            endColumn: user.selection.end.column
          },
          options: {
            className: 'remote-selection',
            inlineClassName: 'remote-selection-inline',
            stickiness: 1,
            hoverMessage: { value: `${user.name}'s selection` }
          }
        });
      }
    });

    // Apply decorations
    const decorationIds = editor.deltaDecorations([], decorations);

    return () => {
      editor.deltaDecorations(decorationIds, []);
    };
  }, [users, editorRef]);

  return null;
};

// Change highlight component for showing recent remote changes
interface RemoteChangeHighlight {
  userId: string;
  userName: string;
  color: string;
  range: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  timestamp: number;
}

interface RemoteChangeHighlightsProps {
  changes: RemoteChangeHighlight[];
  editorRef: React.RefObject<any>;
  fadeOutDuration?: number; // milliseconds
}

export const RemoteChangeHighlights: React.FC<RemoteChangeHighlightsProps> = ({
  changes,
  editorRef,
  fadeOutDuration = 3000
}) => {
  const [activeChanges, setActiveChanges] = useState<RemoteChangeHighlight[]>([]);

  useEffect(() => {
    // Add new changes
    setActiveChanges(prev => [...prev, ...changes]);

    // Set timeout to remove old changes
    const timeouts = changes.map(change => 
      setTimeout(() => {
        setActiveChanges(prev => prev.filter(c => c.timestamp !== change.timestamp));
      }, fadeOutDuration)
    );

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [changes, fadeOutDuration]);

  useEffect(() => {
    if (!editorRef.current || activeChanges.length === 0) return;

    const editor = editorRef.current;
    const decorations = activeChanges.map(change => ({
      range: {
        startLineNumber: change.range.startLine,
        startColumn: change.range.startColumn,
        endLineNumber: change.range.endLine,
        endColumn: change.range.endColumn
      },
      options: {
        className: 'remote-change-highlight',
        inlineClassName: 'remote-change-inline',
        glyphMarginClassName: 'remote-change-glyph',
        glyphMarginHoverMessage: { value: `Changed by ${change.userName}` },
        stickiness: 1
      }
    }));

    const decorationIds = editor.deltaDecorations([], decorations);

    return () => {
      editor.deltaDecorations(decorationIds, []);
    };
  }, [activeChanges, editorRef]);

  return null;
};
