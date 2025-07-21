import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { useTheme } from '../contexts/ThemeContext';
import './CodeEditor.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!editorRef.current) return;

    // Create custom theme based on app theme
    const customTheme = EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: ' "Monolisa", "Monaco", "Menlo", "Ubuntu Mono", monospace',
        height: '100%',
      },
      '.cm-editor': {
        height: '100%',
      },
      '.cm-scroller': {
        fontFamily: '"Monolisa", "Monaco", "Menlo", "Ubuntu Mono", monospace',
      },
      '.cm-content': {
        padding: '16px',
        caretColor: theme === 'dark' ? '#f8f8f2' : '#000000',
      },
      '.cm-line': {
        lineHeight: '1.6',
      },
      '.cm-cursor': {
        borderLeftColor: theme === 'dark' ? '#f8f8f2' : '#000000',
      },
      '.cm-selectionBackground': {
        backgroundColor: theme === 'dark' ? 'rgba(255, 140, 66, 0.25)' : 'rgba(255, 140, 66, 0.2)',
      },
      '.cm-activeLine': {
        backgroundColor: theme === 'dark' ? 'rgba(68, 71, 90, 0.6)' : 'rgba(255, 140, 66, 0.05)',
      },
      '.cm-gutters': {
        backgroundColor: theme === 'dark' ? '#282a36' : '#f8f9fa',
        color: theme === 'dark' ? '#6272a4' : '#5f6368',
        border: 'none',
      },
      '.cm-lineNumbers': {
        color: theme === 'dark' ? '#6272a4' : '#5f6368',
      },
      '.cm-activeLineGutter': {
        backgroundColor: theme === 'dark' ? 'rgba(68, 71, 90, 0.8)' : 'rgba(255, 140, 66, 0.05)',
        color: theme === 'dark' ? '#f8f8f2' : '#000000',
      },
      // Subtle and pleasing dark mode color scheme with pastel blue/purple
      '.cm-keyword': {
        color: theme === 'dark' ? '#b8d4f2' : '#d73a49',
      },
      '.cm-operator': {
        color: theme === 'dark' ? '#d4a574' : '#000000',
      },
      '.cm-variable': {
        color: theme === 'dark' ? '#e8e8e8' : '#24292e',
      },
      '.cm-variable-2': {
        color: theme === 'dark' ? '#e8e8e8' : '#24292e',
      },
      '.cm-def': {
        color: theme === 'dark' ? '#d4a574' : '#6f42c1',
      },
      '.cm-property': {
        color: theme === 'dark' ? '#d4a574' : '#24292e',
      },
      '.cm-number': {
        color: theme === 'dark' ? '#c8a2c8' : '#005cc5',
      },
      '.cm-string': {
        color: theme === 'dark' ? '#d4a574' : '#032f62',
      },
      '.cm-string-2': {
        color: theme === 'dark' ? '#d4a574' : '#032f62',
      },
      '.cm-comment': {
        color: theme === 'dark' ? '#8b7355' : '#6a737d',
        fontStyle: 'italic',
      },
      '.cm-builtin': {
        color: theme === 'dark' ? '#d4a574' : '#e36209',
      },
      '.cm-type': {
        color: theme === 'dark' ? '#d4a574' : '#e36209',
      },
      '.cm-atom': {
        color: theme === 'dark' ? '#c8a2c8' : '#005cc5',
      },
      '.cm-meta': {
        color: theme === 'dark' ? '#e8e8e8' : '#24292e',
      },
      '.cm-tag': {
        color: theme === 'dark' ? '#b8d4f2' : '#22863a',
      },
      '.cm-attribute': {
        color: theme === 'dark' ? '#d4a574' : '#24292e',
      },
      '.cm-qualifier': {
        color: theme === 'dark' ? '#d4a574' : '#6f42c1',
      },
      '.cm-punctuation': {
        color: theme === 'dark' ? '#e8e8e8' : '#000000',
      },
      // Additional Python-specific tokens
      '.cm-definition': {
        color: theme === 'dark' ? '#d4a574' : '#6f42c1',
      },
      '.cm-function': {
        color: theme === 'dark' ? '#d4a574' : '#6f42c1',
      },
      '.cm-parameter': {
        color: theme === 'dark' ? '#d4a574' : '#24292e',
      },
      '.cm-namespace': {
        color: theme === 'dark' ? '#b8d4f2' : '#6f42c1',
      },
      '.cm-class': {
        color: theme === 'dark' ? '#d4a574' : '#6f42c1',
      },
      '.cm-decorator': {
        color: theme === 'dark' ? '#b8d4f2' : '#6f42c1',
      },
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        customTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [theme]);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorViewRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      if (currentValue !== value) {
        const transaction = editorViewRef.current.state.update({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: value,
          },
        });
        editorViewRef.current.dispatch(transaction);
      }
    }
  }, [value]);

  return <div ref={editorRef} className="code-editor-container" />;
};

export default CodeEditor; 