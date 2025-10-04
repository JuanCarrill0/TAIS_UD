// components/MermaidUmlEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidUmlEditor = ({ mermaidCode, onCodeChange, onTransform }) => {
  const [svgOutput, setSvgOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mermaidRef = useRef(null);

  // Configurar Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      }
    });
  }, []);

  // Renderizar diagrama
  const renderDiagram = async () => {
    if (!mermaidCode.trim()) {
      setSvgOutput('<div class="diagram-placeholder">Escribe código Mermaid para ver la vista previa</div>');
      return;
    }
    
    setIsLoading(true);
    try {
      // Usar un ID único para evitar conflictos
      const containerId = `mermaid-${Date.now()}`;
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<div id="${containerId}">${mermaidCode}</div>`;
      }
      
      const { svg } = await mermaid.render(containerId, mermaidCode);
      setSvgOutput(svg);
    } catch (error) {
      console.error('Error rendering diagram:', error);
      setSvgOutput(`<div class="error">
        <h4>❌ Error en la sintaxis</h4>
        <p>${error.message}</p>
        <p>Revisa la sintaxis Mermaid e intenta nuevamente.</p>
      </div>`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 500); // Debounce para evitar renderizados frecuentes
    
    return () => clearTimeout(timer);
  }, [mermaidCode]);

  const handleCodeChange = (newCode) => {
    onCodeChange(newCode);
  };

  const examples = {
    basic: `classDiagram
    class Persona {
      +String nombre
      +int edad
      +caminar() void
    }`,
    
    inheritance: `classDiagram
    class Vehiculo {
      +String marca
      +arrancar() void
    }
    class Auto {
      +int puertas
    }
    class Motocicleta {
      +boolean tieneCareta
    }
    Vehiculo <|-- Auto
    Vehiculo <|-- Motocicleta`,
    
    associations: `classDiagram
    class Estudiante {
      +String idEstudiante
      +String nombre
    }
    class Curso {
      +String codigoCurso
      +String titulo
    }
    class Matricula {
      +Date fechaMatricula
      +String calificacion
    }
    Estudiante "1" --> "many" Matricula
    Curso "1" --> "many" Matricula`
  };

  return (
    <div className="mermaid-editor">
      <div className="editor-header">
        <h3>📊 Editor UML Mermaid</h3>
        <div className="editor-controls">
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleCodeChange(examples[e.target.value]);
              }
            }}
            className="examples-dropdown"
            defaultValue=""
          >
            <option value="">Ejemplos rápidos...</option>
            <option value="basic">Clase Básica</option>
            <option value="inheritance">Herencia</option>
            <option value="associations">Asociaciones</option>
          </select>
          
          <button 
            onClick={onTransform}
            disabled={isLoading}
            className="transform-btn"
          >
            {isLoading ? '⏳ Procesando...' : '🔄 Transformar a XML'}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="code-panel">
          <div className="panel-header">
            <h4>📝 Código Mermaid</h4>
            <button 
              onClick={() => navigator.clipboard.writeText(mermaidCode)}
              className="copy-btn"
            >
              📋 Copiar
            </button>
          </div>
          <textarea
            value={mermaidCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="code-textarea"
            placeholder="Escribe tu diagrama UML en sintaxis Mermaid aquí..."
            spellCheck="false"
          />
        </div>

        <div className="preview-panel">
          <div className="panel-header">
            <h4>👁️ Vista Previa</h4>
            <button 
              onClick={renderDiagram}
              disabled={isLoading}
              className="refresh-btn"
            >
              🔄 Actualizar
            </button>
          </div>
          <div 
            className="mermaid-preview"
            ref={mermaidRef}
            dangerouslySetInnerHTML={{ __html: svgOutput }}
          />
        </div>
      </div>

      <div className="syntax-help">
        <details>
          <summary>📚 Sintaxis Mermaid - Ayuda Rápida</summary>
          <div className="help-content">
            <div className="help-section">
              <h5>Clases:</h5>
              <code>class NombreClase &#123; +tipo atributo +metodo() tipo &#125;</code>
            </div>
            <div className="help-section">
              <h5>Herencia:</h5>
              <code>ClasePadre &lt;|-- ClaseHija</code>
            </div>
            <div className="help-section">
              <h5>Asociaciones:</h5>
              <code>ClaseA "1" -- "1" ClaseB</code><br/>
              <code>ClaseA "1" -- "*" ClaseB</code><br/>
              <code>ClaseA "0..1" -- "1..*" ClaseB</code>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default MermaidUmlEditor;