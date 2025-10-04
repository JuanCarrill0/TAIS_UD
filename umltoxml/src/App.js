// App.jsx
import React, { useState } from 'react';
import UmlEditor from './components/UmlEditor';
import XmlTransformer from './components/XmlTransformer';
import DtdGenerator from './components/DtdGenerator';
import { transformUmlToXml, generateDtd } from './utils/transformationRules';
import './App.css';

function App() {
  const [umlDiagram, setUmlDiagram] = useState(null);
  const [xmlOutput, setXmlOutput] = useState('');
  const [dtdOutput, setDtdOutput] = useState('');

  const handleTransform = () => {
    if (umlDiagram) {
      const xml = transformUmlToXml(umlDiagram);
      const dtd = generateDtd(umlDiagram);
      setXmlOutput(xml);
      setDtdOutput(dtd);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Transformador UML a XML</h1>
        <p>Basado en el modelo de transformación del artículo</p>
      </header>
      
      <div className="app-container">
        <div className="editor-section">
          <UmlEditor 
            onDiagramChange={setUmlDiagram}
            onTransform={handleTransform}
          />
        </div>
        
        <div className="output-section">
          <XmlTransformer xmlContent={xmlOutput} />
          <DtdGenerator dtdContent={dtdOutput} />
        </div>
      </div>
    </div>
  );
}

export default App;