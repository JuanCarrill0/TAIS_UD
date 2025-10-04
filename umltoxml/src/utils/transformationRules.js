// utils/transformationRules.js

// Regla 1: Conversión de clase y sus atributos
export const transformClassWithAttributes = (className, attributes) => {
  const elements = attributes.map(attr => 
    `<!ELEMENT ${attr} (#PCDATA)>`
  ).join('\n');
  
  const classElement = `<!ELEMENT ${className} (${attributes.join(', ')})>`;
  
  return `${classElement}\n${elements}`;
};

// Regla 2: Conversión de asociación multiplicidad 1
export const transformAssociationOne = (classA, classB, attributesA, attributesB) => {
  return `
<!ELEMENT ${classA} (${attributesA.join(', ')}, ${classB})>
<!ELEMENT ${classB} (${attributesB.join(', ')})>
  `.trim();
};

// Regla 3: Conversión de asociación multiplicidad 0..1
export const transformAssociationZeroOne = (classA, classB, attributesA, attributesB) => {
  return `
<!ELEMENT ${classA} (${attributesA.join(', ')}, ${classB}?)>
<!ELEMENT ${classB} (${attributesB.join(', ')})>
  `.trim();
};

// Mecanismo con apuntadores (ID/IDREF)
export const transformWithPointers = (className, attributes, requiresId = false) => {
  const idAttribute = requiresId ? `\n<!ATTLIST ${className} id ID #REQUIRED>` : '';
  
  return `
<!ELEMENT ${className} (${attributes.join(', ')})>${idAttribute}
  `.trim();
};

// Transformación principal UML a XML
export const transformUmlToXml = (umlDiagram) => {
  if (!umlDiagram?.nodes) return '';

  let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xmlContent += '<!-- Generado automáticamente desde diagrama UML -->\n';
  
  const rootElement = findRootElement(umlDiagram.nodes);
  
  if (rootElement) {
    xmlContent += `<${rootElement.data.label}>\n`;
    
    umlDiagram.nodes.forEach(node => {
      if (node.id !== rootElement.id) {
        xmlContent += generateXmlForClass(node);
      }
    });
    
    xmlContent += `</${rootElement.data.label}>\n`;
  }
  
  return xmlContent;
};

const findRootElement = (nodes) => {
  // Buscar clase con grado de entrada 0 (sin dependencias)
  return nodes.find(node => 
    node.data.label && 
    !node.data.attributes.some(attr => attr.includes('->'))
  ) || nodes[0];
};

const generateXmlForClass = (node) => {
  const className = node.data.label;
  const indent = '  ';
  
  let xml = `${indent}<${className}`;
  
  // Agregar ID si es necesario
  if (node.data.attributes.length > 0) {
    xml += ` id="${className.toLowerCase()}_1"`;
  }
  
  if (node.data.attributes.length === 0) {
    xml += ' />\n';
  } else {
    xml += '>\n';
    
    node.data.attributes.forEach(attr => {
      if (!attr.includes('->')) {
        xml += `${indent}${indent}<${attr}>valor_${attr}</${attr}>\n`;
      }
    });
    
    xml += `${indent}</${className}>\n`;
  }
  
  return xml;
};

// Generador de DTD
export const generateDtd = (umlDiagram) => {
  if (!umlDiagram?.nodes) return '';

  let dtdContent = '<!-- DTD Generado automáticamente -->\n';
  dtdContent += '<!DOCTYPE schema [\n';

  umlDiagram.nodes.forEach(node => {
    const className = node.data.label;
    const attributes = node.data.attributes.filter(attr => !attr.includes('->'));
    
    if (attributes.length > 0) {
      dtdContent += `  <!ELEMENT ${className} (${attributes.join(', ')})>\n`;
      
      attributes.forEach(attr => {
        dtdContent += `  <!ELEMENT ${attr} (#PCDATA)>\n`;
      });
      
      // Agregar ID para referencias
      dtdContent += `  <!ATTLIST ${className} id ID #REQUIRED>\n\n`;
    }
  });

  // Agregar elementos de apuntador para asociaciones
  umlDiagram.edges.forEach(edge => {
    const sourceNode = umlDiagram.nodes.find(n => n.id === edge.source);
    const targetNode = umlDiagram.nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      dtdContent += `  <!ELEMENT ap${targetNode.data.label} EMPTY>\n`;
      dtdContent += `  <!ATTLIST ap${targetNode.data.label} point IDREF #REQUIRED>\n\n`;
    }
  });

  dtdContent += ']>';

  return dtdContent;
};