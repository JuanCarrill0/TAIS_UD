// components/DtdGenerator.jsx
import React from 'react';
import { downloadFile } from '../utils/fileDownloader'; 

const DtdGenerator = ({ dtdContent }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dtdContent);
      alert('DTD copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };


const dtdDownload = () => {
    if (!dtdContent) {
      alert('No hay contenido para descargar');
      return;
    }
    downloadFile(dtdContent, 'modeloDTD.dtd', 'application/xml-dtd');
  };
  
  return (
    <div className="dtd-generator">
      <div className="section-header">
        <h3>DTD Generado</h3>
        <button 
          onClick={copyToClipboard}
          disabled={!dtdContent}
          className="copy-btn"
        >
          Copiar DTD
        </button>
        <button 
              onClick={dtdDownload}
              disabled={!dtdContent}
              className="download-btn"
        >
              Descargar DTD
        </button>
      </div>
      
      <div className="code-container">
        <pre className="dtd-code">
          {dtdContent || '// El DTD aparecerá aquí después de la transformación'}
        </pre>
      </div>
    </div>
  );
};

export default DtdGenerator;