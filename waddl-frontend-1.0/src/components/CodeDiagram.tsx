import React from 'react';
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
  const renderNode = (node: any, depth: number = 0): DiagramNode[] => {
    if (!node) return [];

    const nodes: DiagramNode[] = [];

    if (Array.isArray(node)) {
      node.forEach((item, index) => {
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
            value: `${node.func?.id || 'func'}()`,
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
            children: []
          });
          break;
        case 'BinOp':
          nodes.push({
            id: `binop-${depth}`,
            type: 'binop',
            value: `${renderValue(node.left)} ${renderOperator(node.op)} ${renderValue(node.right)}`,
            children: []
          });
          break;
        case 'BoolOp':
          nodes.push({
            id: `boolop-${depth}`,
            type: 'boolop',
            value: node.op === 'and' || node.op === 'or' ? node.op : 'bool',
            children: renderNode(node.values, depth + 1)
          });
          break;
        case 'IfExp':
          nodes.push({
            id: `ifexpr-${depth}`,
            type: 'if_expr',
            value: `${renderValue(node.body)} if ${renderValue(node.test)} else ${renderValue(node.orelse)}`,
            children: []
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
      nodes.push({
        id: `value-${depth}`,
        type: typeof node === 'number' ? 'int' : typeof node,
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
      And: 'and', Or: 'or'
    };
    return opMap[op] || op;
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
  );
};

export default CodeDiagram;
