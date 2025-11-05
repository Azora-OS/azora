/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import styled from '@emotion/styled';

// VS Code-inspired Design Tokens
const VSTokens = {
  // Color themes inspired by VS Code
  themes: {
    dark: {
      background: '#1E1E1E',
      foreground: '#D4D4D4',
      cursor: '#AEAFAD',
      selection: '#264F78',
      lineHighlight: '#2D2D30',
      gutter: '#333333',
      activeLine: '#2D2D30',
      error: '#F48771',
      warning: '#FFCC02',
      info: '#75BEFF',
      success: '#4EC9B0',
    },
    light: {
      background: '#FFFFFF',
      foreground: '#000000',
      cursor: '#000000',
      selection: '#ADD6FF',
      lineHighlight: '#F0F0F0',
      gutter: '#F3F3F3',
      activeLine: '#F0F0F0',
      error: '#F14C4C',
      warning: '#FFC600',
      info: '#007ACC',
      success: '#008000',
    },
    'azora-dark': {
      background: '#0D1117',
      foreground: '#F0F6FC',
      cursor: '#58A6FF',
      selection: '#264F78',
      lineHighlight: '#161B22',
      gutter: '#0D1117',
      activeLine: '#161B22',
      error: '#F85149',
      warning: '#D29922',
      info: '#58A6FF',
      success: '#3FB950',
    },
  },
  // Typography
  typography: {
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontSize: 14,
    lineHeight: 1.4,
  },
  // Layout
  layout: {
    minHeight: '400px',
    minWidth: '600px',
    padding: '16px',
  },
  // Animations
  animations: {
    cursorBlink: '1s infinite',
    scrollDuration: '200ms',
  },
};

// Styled Components
const EditorContainer = styled.div<{
  theme: keyof typeof VSTokens.themes;
  focused: boolean;
  minimap: boolean;
  lineNumbers: boolean;
}>`
  font-family: ${VSTokens.typography.fontFamily};
  font-size: ${VSTokens.typography.fontSize}px;
  line-height: ${VSTokens.typography.lineHeight};
  background: ${props => VSTokens.themes[props.theme].background};
  border: 1px solid ${props => props.focused ? '#0078D4' : '#E1E1E1'};
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s ease;
  min-height: ${VSTokens.layout.minHeight};
  min-width: ${VSTokens.layout.minWidth};
  position: relative;
  
  &:focus-within {
    border-color: #0078D4;
    box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.2);
  }
  
  .monaco-editor {
    background: ${props => VSTokens.themes[props.theme].background} !important;
  }
  
  .monaco-editor .margin {
    background: ${props => VSTokens.themes[props.theme].gutter} !important;
  }
  
  .monaco-editor .current-line {
    border: none !important;
    background: ${props => VSTokens.themes[props.theme].activeLine} !important;
  }
  
  .monaco-editor .line-numbers {
    color: ${props => VSTokens.themes[props.theme].foreground}40 !important;
  }
  
  .monaco-editor .cursor {
    background: ${props => VSTokens.themes[props.theme].cursor} !important;
    animation: blink ${VSTokens.animations.cursorBlink};
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`;

const EditorHeader = styled.div<{
  theme: keyof typeof VSTokens.themes;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: ${props => VSTokens.themes[props.theme].lineHighlight};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#333333' : '#E1E1E1'};
  font-size: 12px;
  color: ${props => VSTokens.themes[props.theme].foreground}80;
`;

const EditorActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button<{
  theme: keyof typeof VSTokens.themes;
  active?: boolean;
}>`
  background: ${props => props.active ? '#0078D4' : 'transparent'};
  color: ${props => props.active ? '#FFFFFF' : VSTokens.themes[props.theme].foreground}80;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#106EBE' : 'rgba(0, 120, 212, 0.1)'};
    color: ${props => props.active ? '#FFFFFF' : '#0078D4'};
  }
`;

const StatusBar = styled.div<{
  theme: keyof typeof VSTokens.themes;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 16px;
  background: ${props => VSTokens.themes[props.theme].activeLine};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#333333' : '#E1E1E1'};
  font-size: 12px;
  color: ${props => VSTokens.themes[props.theme].foreground}60;
`;

const StatusItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CommandPalette = styled.div<{
  visible: boolean;
  theme: keyof typeof VSTokens.themes;
}>`
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  max-height: 400px;
  background: ${props => VSTokens.themes[props.theme].background};
  border: 1px solid ${props => props.theme === 'dark' ? '#333333' : '#E1E1E1'};
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${props => props.visible ? 'block' : 'none'};
  overflow: hidden;
`;

const CommandInput = styled.input<{
  theme: keyof typeof VSTokens.themes;
}>`
  width: 100%;
  padding: 12px 16px;
  background: ${props => VSTokens.themes[props.theme].lineHighlight};
  border: none;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#333333' : '#E1E1E1'};
  color: ${props => VSTokens.themes[props.theme].foreground};
  font-family: ${VSTokens.typography.fontFamily};
  font-size: 14px;
  
  &:focus {
    outline: none;
  }
`;

const CommandList = styled.div<{
  theme: keyof typeof VSTokens.themes;
}>`
  max-height: 300px;
  overflow-y: auto;
`;

const CommandItem = styled.div<{
  theme: keyof typeof VSTokens.themes;
  selected?: boolean;
}>`
  padding: 8px 16px;
  background: ${props => props.selected ? VSTokens.themes[props.theme].selection : 'transparent'};
  color: ${props => VSTokens.themes[props.theme].foreground};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: ${props => VSTokens.themes[props.theme].selection};
  }
`;

const CommandIcon = styled.span`
  width: 16px;
  text-align: center;
`;

const CommandText = styled.div`
  flex: 1;
`;

const CommandDescription = styled.div<{
  theme: keyof typeof VSTokens.themes;
}>`
  font-size: 12px;
  color: ${props => VSTokens.themes[props.theme].foreground}60;
`;

// Editor Props
export interface AzoraVSEditorProps {
  value?: string;
  language?: string;
  theme?: keyof typeof VSTokens.themes;
  onChange?: (value: string) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  height?: string | number;
  width?: string | number;
  readOnly?: boolean;
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  fontFamily?: string;
  extensions?: string[];
  commands?: VSCommand[];
  onSave?: (content: string) => void;
  onFormat?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// VS Command Interface
export interface VSCommand {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  action: () => void;
  keybinding?: string;
}

// Main Editor Component
export const AzoraVSEditor: React.FC<AzoraVSEditorProps> = ({
  value = '',
  language = 'typescript',
  theme = 'azora-dark',
  onChange,
  onMount,
  options = {},
  height = '400px',
  width = '100%',
  readOnly = false,
  minimap = true,
  lineNumbers = true,
  wordWrap = true,
  fontSize = VSTokens.typography.fontSize,
  fontFamily = VSTokens.typography.fontFamily,
  extensions = [],
  commands = [],
  onSave,
  onFormat,
  onFind,
  onReplace,
  className,
  style,
  'data-testid': dataTestId,
  ...rest
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const [focused, setFocused] = useState(false);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [language, setLanguage] = useState(language);

  // Default commands
  const defaultCommands: VSCommand[] = [
    {
      id: 'save',
      title: 'Save File',
      description: 'Save the current file',
      icon: '💾',
      category: 'File',
      action: () => onSave?.(value),
      keybinding: 'Ctrl+S',
    },
    {
      id: 'format',
      title: 'Format Document',
      description: 'Format the entire document',
      icon: '🎨',
      category: 'Edit',
      action: () => onFormat?.(),
      keybinding: 'Ctrl+Shift+F',
    },
    {
      id: 'find',
      title: 'Find',
      description: 'Find in current file',
      icon: '🔍',
      category: 'Edit',
      action: () => onFind?.(),
      keybinding: 'Ctrl+F',
    },
    {
      id: 'replace',
      title: 'Replace',
      description: 'Replace in current file',
      icon: '🔄',
      category: 'Edit',
      action: () => onReplace?.(),
      keybinding: 'Ctrl+H',
    },
    {
      id: 'toggleTheme',
      title: 'Toggle Theme',
      description: 'Switch between light and dark themes',
      icon: '🌓',
      category: 'View',
      action: () => {
        // Theme switching logic would go here
      },
    },
  ];

  const allCommands = [...defaultCommands, ...commands];

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor options
    editor.updateOptions({
      theme: theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'vs-dark',
      fontSize,
      fontFamily,
      wordWrap: wordWrap ? 'on' : 'off',
      minimap: { enabled: minimap },
      lineNumbers: lineNumbers ? 'on' : 'off',
      readOnly,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      ...options,
    });

    // Set up event listeners
    editor.onDidFocusEditorText(() => setFocused(true));
    editor.onDidBlurEditorText(() => setFocused(false));
    
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    editor.onDidChangeCursorSelection((e) => {
      const selection = e.model.getSelections()[0];
      if (selection && !selection.isEmpty()) {
        setSelectedText(editor.getModel()?.getValueInRange(selection) || '');
      } else {
        setSelectedText('');
      }
    });

    // Add keyboard shortcuts
    editor.addAction({
      id: 'command-palette',
      label: 'Show Command Palette',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP],
      run: () => {
        setCommandPaletteVisible(true);
        setCommandQuery('');
        setSelectedCommandIndex(0);
      },
    });

    // Add custom commands
    allCommands.forEach((command) => {
      if (command.keybinding) {
        const keys = command.keybinding.split('+');
        let keybinding = 0;
        
        keys.forEach((key) => {
          switch (key.trim()) {
            case 'Ctrl':
            case 'Cmd':
              keybinding |= monaco.KeyMod.CtrlCmd;
              break;
            case 'Shift':
              keybinding |= monaco.KeyMod.Shift;
              break;
            case 'Alt':
              keybinding |= monaco.KeyMod.Alt;
              break;
            case 'S':
              keybinding |= monaco.KeyCode.KeyS;
              break;
            case 'F':
              keybinding |= monaco.KeyCode.KeyF;
              break;
            case 'H':
              keybinding |= monaco.KeyCode.KeyH;
              break;
            case 'P':
              keybinding |= monaco.KeyCode.KeyP;
              break;
          }
        });

        editor.addAction({
          id: command.id,
          label: command.title,
          keybindings: [keybinding],
          run: command.action,
        });
      }
    });

    onMount?.(editor);
  }, [theme, fontSize, fontFamily, wordWrap, minimap, lineNumbers, readOnly, options, onMount, allCommands]);

  // Handle value change
  const handleEditorChange = useCallback((value: string | undefined) => {
    onChange?.(value || '');
  }, [onChange]);

  // Filter commands based on query
  const filteredCommands = allCommands.filter((command) =>
    command.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
    command.description?.toLowerCase().includes(commandQuery.toLowerCase())
  );

  // Handle command palette navigation
  const handleCommandKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCommandIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCommandIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          filteredCommands[selectedCommandIndex].action();
          setCommandPaletteVisible(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setCommandPaletteVisible(false);
        break;
    }
  }, [filteredCommands, selectedCommandIndex]);

  return (
    <EditorContainer
      theme={theme}
      focused={focused}
      minimap={minimap}
      lineNumbers={lineNumbers}
      className={className}
      style={{ height, width, ...style }}
      data-testid={dataTestId}
      {...rest}
    >
      {/* Editor Header */}
      <EditorHeader theme={theme}>
        <div>{language}</div>
        <EditorActions>
          <ActionButton theme={theme} onClick={() => setCommandPaletteVisible(true)}>
            ⌘P
          </ActionButton>
          <ActionButton theme={theme} onClick={onFormat}>
            Format
          </ActionButton>
          <ActionButton theme={theme} onClick={onFind}>
            Find
          </ActionButton>
        </EditorActions>
      </EditorHeader>

      {/* Command Palette */}
      <CommandPalette visible={commandPaletteVisible} theme={theme}>
        <CommandInput
          theme={theme}
          value={commandQuery}
          onChange={(e) => setCommandQuery(e.target.value)}
          onKeyDown={handleCommandKeyDown}
          placeholder="Type a command or search..."
          autoFocus
        />
        <CommandList theme={theme}>
          {filteredCommands.map((command, index) => (
            <CommandItem
              key={command.id}
              theme={theme}
              selected={index === selectedCommandIndex}
              onClick={() => {
                command.action();
                setCommandPaletteVisible(false);
              }}
            >
              <CommandIcon>{command.icon}</CommandIcon>
              <CommandText>
                <div>{command.title}</div>
                {command.description && (
                  <CommandDescription theme={theme}>
                    {command.description}
                  </CommandDescription>
                )}
              </CommandText>
            </CommandItem>
          ))}
        </CommandList>
      </CommandPalette>

      {/* Monaco Editor */}
      <div style={{ flex: 1 }}>
        <Monaco
          value={value}
          language={language}
          theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'vs-dark'}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            theme: theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'vs-dark',
            fontSize,
            fontFamily,
            wordWrap: wordWrap ? 'on' : 'off',
            minimap: { enabled: minimap },
            lineNumbers: lineNumbers ? 'on' : 'off',
            readOnly,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            ...options,
          }}
        />
      </div>

      {/* Status Bar */}
      <StatusBar theme={theme}>
        <StatusItem>
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </StatusItem>
        <StatusItem>
          {selectedText && `Selected ${selectedText.length} characters`}
          {readOnly && 'Read-Only'}
        </StatusItem>
        <StatusItem>
          {language} • UTF-8
        </StatusItem>
      </StatusBar>
    </EditorContainer>
  );
};

export default AzoraVSEditor;

