import React, { useState, useRef, useEffect } from 'react';
import './CodeDiagram.css';

interface CodeDiagramProps {
  parsedData: any;
}

interface DiagramNode {
  id: string;
  type: string;
  value: string;
  children?: DiagramNode[];
  position?: { x: number; y: number };
}

const CodeDiagram: React.FC<CodeDiagramProps> = ({ parsedData }) => {
  const [topPanelHeight, setTopPanelHeight] = useState(70); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  let idCounter = 0;
  const nextId = () => `node-${idCounter++}`;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    // Constrain to reasonable bounds (30% - 80%)
    const constrainedHeight = Math.max(30, Math.min(80, newTopHeight));
    setTopPanelHeight(constrainedHeight);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const renderNode = (node: any, depth: number = 0): DiagramNode[] => {
    if (!node) return [];

    const nodes: DiagramNode[] = [];

    if (Array.isArray(node)) {
      node.forEach((item) => {
        nodes.push(...renderNode(item, depth + 1));
      });
    } else if (typeof node === 'object') {
      switch (node.type) {
        case 'FunctionDef':
          nodes.push({
            id: `func-${node.name || 'anonymous'}-${depth}`,
            type: 'function',
            value: `def ${node.name || 'anonymous'}()`,
            children: renderNode(node.body, depth + 1)
          });
          break;
        case 'Call':
          nodes.push({
            id: `call-${node.func?.id || 'func'}-${depth}`,
            type: 'call',
            value: `${node.func?.id || 'func'}()` ,
            children: renderNode(node.args, depth + 1)
          });
          break;
        case 'Assign':
          nodes.push({
            id: `assign-${node.targets?.[0]?.id || 'var'}-${depth}`,
            type: 'assign',
            value: `${node.targets?.[0]?.id || 'var'} = ${renderValue(node.value)}`,
            children: []
          });
          break;
        case 'For':
          nodes.push({
            id: `for-${depth}`,
            type: 'loop',
            value: `for ${renderValue(node.target)} in ${renderValue(node.iter)}`,
            children: renderNode(node.body, depth + 1)
          });
          break;
        case 'If':
          nodes.push({
            id: `if-${depth}`,
            type: 'condition',
            value: `if ${renderValue(node.test)}`,
            children: renderNode(node.body, depth + 1)
          });
          break;
        case 'Return':
          nodes.push({
            id: `return-${depth}`,
            type: 'return',
            value: `return ${renderValue(node.value)}`,
            children: []
          });
          break;
        case 'Expr':
          nodes.push({
            id: `expr-${depth}`,
            type: 'expression',
            value: renderValue(node.value),
            children: renderNode(node.value, depth + 1)
          });
          break;
        case 'BinOp':
          nodes.push({
            id: `binop-${depth}`,
            type: 'math-gate',
            value: renderOperator(node.op),
            children: [
              ...renderNode(node.left, depth + 1),
              ...renderNode(node.right, depth + 1)
            ]
          });
          break;
        case 'BoolOp':
          nodes.push({
            id: `boolop-${depth}`,
            type: 'logic-gate',
            value: renderOperator(node.op),
            children: renderNode(node.values, depth + 1)
          });
          break;
        case 'IfExp':
          nodes.push({
            id: `ifexpr-${depth}`,
            type: 'if_expr',
            value: `if`,
            children: [
              ...renderNode(node.test, depth + 1),
              ...renderNode(node.body, depth + 1),
              ...renderNode(node.orelse, depth + 1)
            ]
          });
          break;
        default:
          Object.entries(node).forEach(([key, value]) => {
            if (key !== 'type' && key !== 'lineno' && key !== 'col_offset') {
              nodes.push(...renderNode(value, depth + 1));
            }
          });
          break;
      }
    } else {
      const valueType = typeof node;
      nodes.push({
        id: `value-${depth}-${nextId()}`,
        type: valueType === 'number' ? 'int' : valueType === 'string' ? 'string' : valueType,
        value: String(node),
        children: []
      });
    }

    return nodes;
  };

  const renderValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value?.id) return value.id;
    if (value?.value !== undefined) return renderValue(value.value);
    if (value?.n !== undefined) return value.n.toString();
    return '...';
  };

  const renderOperator = (op: any): string => {
    if (!op || typeof op !== 'string') return '?';
    const opMap: Record<string, string> = {
      Add: '+', Sub: '-', Mult: '*', Div: '/', Mod: '%', Pow: '^',
      And: '∧', Or: '∨'
    };
    return opMap[op] || op;
  };

  const formatJson = (obj: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (obj === null) return 'null';
    if (typeof obj === 'string') return `"${obj}"`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => spaces + '  ' + formatJson(item, indent + 1)).join(',\n');
      return `[\n${items}\n${spaces}]`;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      
      const items = keys.map(key => {
        const value = formatJson(obj[key], indent + 1);
        return `${spaces}  "${key}": ${value}`;
      }).join(',\n');
      
      return `{\n${items}\n${spaces}}`;
    }
    
    return String(obj);
  };

  const diagramNodes = renderNode(parsedData);

  if (diagramNodes.length === 0) {
    return (
      <div className="code-diagram">
        <div className="diagram-placeholder">
          <p>No parseable code structure found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-diagram">
      <div className="split-panel-container" ref={containerRef}>
        {/* Top Panel - Diagram */}
        <div 
          className="top-panel"
          style={{ height: `${topPanelHeight}%` }}
        >
          <div className="panel-header">
            <h3 className="panel-title">Code Structure</h3>
          </div>
          <div className="diagram-container">
            {diagramNodes.map((node) => (
              <div key={node.id} className={`diagram-node ${node.type}`}>
                <div className="node-content">
                  <span className="node-type">{node.type}</span>
                  <span className="node-value">{node.value}</span>
                </div>
                {node.children && node.children.length > 0 && (
                  <div className="node-children">
                    {node.children.map((child) => (
                      <div key={child.id} className="child-node">
                        <div className="connection-line"></div>
                        <div className={`diagram-node ${child.type}`}>
                          <div className="node-content">
                            <span className="node-type">{child.type}</span>
                            <span className="node-value">{child.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resizable Divider */}
        <div 
          className={`panel-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        >
          <div className="divider-handle">
            <div className="divider-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - JSON Tree */}
        <div 
          className="bottom-panel"
          style={{ height: `${100 - topPanelHeight}%` }}
        >
          <div className="panel-header">
            <h3 className="panel-title">Raw JSON Tree</h3>
          </div>
          <div className="json-viewer">
            <pre className="json-content">{formatJson(parsedData)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDiagram;

