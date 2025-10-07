// App.jsx
import React, { useState } from 'react';
import MermaidUmlEditor from './components/MermaidUmlEditor';
import XmlTransformer from './components/XmlTransformer';
import DtdGenerator from './components/DtdGenerator';
import { parseMermaidToUmlModel } from './utils/mermaidParser';
import { generateXmlFromUml } from './utils/xmlGenerator';
import { generateDtdFromUml } from './utils/dtdGenerator';
import './App.css';

function App() {
  const [mermaidCode, setMermaidCode] = useState(`classDiagram
    class Animal {
      +String name
      +int age
      +eat() void
    }
    
    class Dog {
      +bark() void
    }
    
    class Cat {
      +meow() void
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`);
    
  const [xmlOutput, setXmlOutput] = useState('');
  const [dtdOutput, setDtdOutput] = useState('');
  const [error, setError] = useState('');

  const handleTransform = () => {
    try {
      setError('');
      const umlModel = parseMermaidToUmlModel(mermaidCode);
      const xml = generateXmlFromUml(umlModel);
      const dtd = generateDtdFromUml(umlModel);
      
      setXmlOutput(xml);
      setDtdOutput(dtd);
    } catch (err) {
      setError(`Error en la transformación: ${err.message}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Transformador UML a DTD y XML</h1>
      </header>
      
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
      
      <div className="app-container">
        <div className="input-section">
          <MermaidUmlEditor 
            mermaidCode={mermaidCode}
            onCodeChange={setMermaidCode}
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