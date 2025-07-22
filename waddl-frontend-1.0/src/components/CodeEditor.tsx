import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { useTheme } from '../contexts/ThemeContext';
import './CodeEditor.css';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLanguageChange?: (language: string) => void;
  placeholder?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, onLanguageChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const { theme } = useTheme();
  const [detectedLanguage, setDetectedLanguage] = useState<string>('python');

  // Language detection patterns
  const languagePatterns = {
    python: [
      /^#!.*python/,
      /import\s+[a-zA-Z_][a-zA-Z0-9_]*/,
      /from\s+[a-zA-Z_][a-zA-Z0-9_]*\s+import/,
      /def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
      /class\s+[a-zA-Z_][a-zA-Z0-9_]*/,
      /if\s+__name__\s*==\s*['"]__main__['"]/,
      /print\s*\(/,
      /range\s*\(/,
      /len\s*\(/,
      /\.py$/,
    ],
    javascript: [
      /^#!.*node/,
      /function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
      /const\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=/,
      /let\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=/,
      /var\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=/,
      /console\.log\s*\(/,
      /\.js$/,
      /\.jsx$/,
      /\.ts$/,
      /\.tsx$/,
    ],
    java: [
      /public\s+class\s+[a-zA-Z_][a-zA-Z0-9_]*/,
      /public\s+static\s+void\s+main\s*\(/,
      /import\s+java\./,
      /System\.out\.println\s*\(/,
      /\.java$/,
    ],
    cpp: [
      /#include\s*<[^>]+>/,
      /#include\s*"[^"]+"/,
      /using\s+namespace\s+std/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /\.cpp$/,
      /\.c$/,
      /\.h$/,
      /\.hpp$/,
    ],
    rust: [
      /fn\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
      /let\s+mut\s+[a-zA-Z_][a-zA-Z0-9_]*/,
      /println!\s*\(/,
      /use\s+[a-zA-Z_][a-zA-Z0-9_]*::/,
      /\.rs$/,
    ],
    go: [
      /package\s+main/,
      /import\s+["']/,
      /func\s+main\s*\(/,
      /fmt\.Println\s*\(/,
      /\.go$/,
    ],
    php: [
      /<\?php/,
      /echo\s+/,
      /function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
      /\$\w+/,
      /\.php$/,
    ],
    sql: [
      /SELECT\s+.+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+.+SET/i,
      /DELETE\s+FROM/i,
      /CREATE\s+TABLE/i,
      /\.sql$/,
    ],
    html: [
      /<!DOCTYPE\s+html/i,
      /<html/i,
      /<head/i,
      /<body/i,
      /<div/i,
      /<span/i,
      /\.html$/,
      /\.htm$/,
    ],
    css: [
      /@media/,
      /@keyframes/,
      /@import/,
      /[a-zA-Z-]+\s*:\s*[^;]+;/,
      /\.css$/,
    ],
    json: [
      /^\s*\{/,
      /^\s*\[/,
      /"[\w-]+"\s*:/,
      /\.json$/,
    ],
    markdown: [
      /^#\s+/,
      /^##\s+/,
      /^###\s+/,
      /^\*\s+/,
      /^-\s+/,
      /^>\s+/,
      /\.md$/,
      /\.markdown$/,
    ],
  };

  const detectLanguage = (code: string): string => {
    const lines = code.split('\n');
    const scores: { [key: string]: number } = {};

    // Initialize scores
    Object.keys(languagePatterns).forEach(lang => {
      scores[lang] = 0;
    });

    // Check each line against patterns
    lines.forEach(line => {
      Object.entries(languagePatterns).forEach(([lang, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.test(line)) {
            scores[lang]++;
          }
        });
      });
    });

    // Find the language with the highest score
    let maxScore = 0;
    let detectedLang = 'python'; // default

    Object.entries(scores).forEach(([lang, score]) => {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang;
      }
    });

    return detectedLang;
  };

  const getLanguageExtension = (language: string) => {
    const extensions = {
      python: python(),
      javascript: javascript(),
      java: java(),
      cpp: cpp(),
      rust: rust(),
      go: go(),
      php: php(),
      sql: sql(),
      html: html(),
      css: css(),
      json: json(),
      markdown: markdown(),
    };
    return extensions[language as keyof typeof extensions] || python();
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // Detect language from current code
    const language = detectLanguage(value);
    setDetectedLanguage(language);
    
    // Notify parent component of language change
    if (onLanguageChange) {
      onLanguageChange(language);
    }

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
        getLanguageExtension(language),
        customTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
            
            // Re-detect language when code changes significantly
            const newLanguage = detectLanguage(newValue);
            if (newLanguage !== detectedLanguage) {
              setDetectedLanguage(newLanguage);
              if (onLanguageChange) {
                onLanguageChange(newLanguage);
              }
            }
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
  }, [theme, detectedLanguage]);

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