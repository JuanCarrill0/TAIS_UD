// components/XmlTransformer.jsx
import React from 'react';
import { downloadFile } from '../utils/fileDownloader'; 

const XmlTransformer = ({ xmlContent }) => {
  const formatXml = (xml) => {
    if (!xml) return '';
    
    // Simple XML formatting
    const formatted = xml
      .replace(/></g, '>\n<')
      .replace(/(<[^/][^>]*>)/g, '\n$1')
      .replace(/(<\/[^>]+>)/g, '$1\n');
    
    return formatted.trim();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      alert('XML copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  const xmlDownload = () => {
      if (!xmlContent) {
        alert('No hay contenido para descargar');
        return;
      }
      downloadFile(xmlContent, 'modeloXML.xmi', 'application/xml-dtd');
    };

  return (
    <div className="xml-transformer">
      <div className="section-header">
        <h3>XML Generado</h3>
        <button 
          onClick={copyToClipboard}
          disabled={!xmlContent}
          className="copy-btn"
        >
          Copiar XML
        </button>
        <button 
              onClick={xmlDownload}
              disabled={!xmlContent}
              className="download-btn"
        >
              Descargar XML
        </button>
      </div>
      
      <div className="code-container">
        <pre className="xml-code">
          {formatXml(xmlContent) || '// El XML aparecerá aquí después de la transformación'}
        </pre>
      </div>
    </div>
  );
};

export default XmlTransformer;