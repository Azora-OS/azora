import React, { useRef, useState } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  language: string;
  path?: string;
  onChange?: (value: string | undefined) => void;
  onSave?: () => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  path,
  onChange,
  onSave,
}) => {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [, setIsReady] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsReady(true);

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace",
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) {
        onSave();
      }
    });

    // Configure TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    // Configure diagnostics options
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // 🌟 CITADEL INTELLISENSE PROVIDER
    // Adds autocomplete for Azora's physical/virtual building blocks
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'CitadelRoom',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: '<CitadelRoom name="${1:Nexus}" capacity={${2:50}} />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'A physical/virtual room in the Citadel campus.'
          },
          {
            label: 'HolographicDisplay',
            kind: monaco.languages.CompletionItemKind.Component,
            insertText: '<HolographicDisplay resolution="8k" interaction="gesture" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: '3D holographic projection surface.'
          },
          {
            label: 'UbuntuSensor',
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: '<UbuntuSensor type="${1:presence}" network="${2:mesh}" />',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'IoT sensor for tracking collective presence.'
          },
          {
            label: '@DivineLaw',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '@DivineLaw(Principle.${1:UBUNTU})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Decorator to bind code to Constitutional Principles.'
          }
        ];
        return { suggestions };
      }
    });

    // Configure JavaScript defaults
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      allowJs: true,
    });

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        path={path}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: false,
          domReadOnly: false,
        }}
        loading={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#cccccc',
          }}>
            Loading Monaco Editor...
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
