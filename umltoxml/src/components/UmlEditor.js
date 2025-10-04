// components/UmlEditor.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

const UmlEditor = ({ onDiagramChange, onTransform }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addClass = () => {
    const newClass = {
      id: `class-${Date.now()}`,
      type: 'umlClass',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: 'NuevaClase',
        attributes: [],
        methods: []
      }
    };
    setNodes((nds) => [...nds, newClass]);
  };

  const addAttribute = (classId, attributeName) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === classId) {
          return {
            ...node,
            data: {
              ...node.data,
              attributes: [...node.data.attributes, attributeName]
            }
          };
        }
        return node;
      })
    );
  };

  const updateDiagram = useCallback(() => {
    const diagram = {
      nodes: nodes,
      edges: edges,
      timestamp: new Date().toISOString()
    };
    onDiagramChange(diagram);
  }, [nodes, edges, onDiagramChange]);

  return (
    <div className="uml-editor">
      <div className="editor-toolbar">
        <button onClick={addClass} className="toolbar-btn">
          ➕ Agregar Clase
        </button>
        <button onClick={updateDiagram} className="toolbar-btn">
          💾 Actualizar Diagrama
        </button>
        <button onClick={onTransform} className="toolbar-btn transform-btn">
          🔄 Transformar a XML
        </button>
      </div>

      <div className="editor-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(event, node) => setSelectedClass(node)}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
          
          <Panel position="top-right">
            <div className="properties-panel">
              <h4>Propiedades de Clase</h4>
              {selectedClass && (
                <ClassProperties 
                  node={selectedClass}
                  onUpdate={setNodes}
                />
              )}
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

const ClassProperties = ({ node, onUpdate }) => {
  const [newAttribute, setNewAttribute] = useState('');

  const handleAddAttribute = () => {
    if (newAttribute.trim()) {
      onUpdate((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                attributes: [...n.data.attributes, newAttribute.trim()]
              }
            };
          }
          return n;
        })
      );
      setNewAttribute('');
    }
  };

  return (
    <div className="class-properties">
      <div className="property-group">
        <label>Nombre de Clase:</label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => {
            onUpdate((nds) =>
              nds.map((n) => {
                if (n.id === node.id) {
                  return {
                    ...n,
                    data: { ...n.data, label: e.target.value }
                  };
                }
                return n;
              })
            );
          }}
        />
      </div>

      <div className="property-group">
        <label>Atributos:</label>
        <div className="attributes-list">
          {node.data.attributes.map((attr, index) => (
            <div key={index} className="attribute-item">
              {attr}
            </div>
          ))}
        </div>
        <div className="add-attribute">
          <input
            type="text"
            value={newAttribute}
            onChange={(e) => setNewAttribute(e.target.value)}
            placeholder="Nuevo atributo"
          />
          <button onClick={handleAddAttribute}>+</button>
        </div>
      </div>
    </div>
  );
};

export default UmlEditor;