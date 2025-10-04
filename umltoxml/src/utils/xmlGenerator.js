// utils/xmlGenerator.js

// Generar XML basado en el modelo UML
export const generateXmlFromUml = (umlModel) => {
  const rootElement = findRootElement(umlModel);
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!-- Generado automáticamente desde diagrama UML Mermaid -->\n';
  xml += '<!-- Basado en el mecanismo de transformación del artículo -->\n\n';
  
  if (rootElement) {
    xml += `<Schema nombre="${rootElement.name}">\n`;
    
    // Generar elementos para cada clase
    umlModel.classes.forEach((classObj) => {
      xml += generateClassXml(classObj, umlModel, 1);
    });
    
    // Generar relaciones
    if (umlModel.inheritances.length > 0 || umlModel.associations.length > 0) {
      xml += '  <Relaciones>\n';
      
      umlModel.inheritances.forEach(inheritance => {
        xml += `    <Herencia padre="${inheritance.parent}" hija="${inheritance.child}"/>\n`;
      });
      
      umlModel.associations.forEach(association => {
        xml += `    <Asociacion origen="${association.source}" destino="${association.target}" `;
        xml += `multiplicidadOrigen="${association.sourceMultiplicity}" `;
        xml += `multiplicidadDestino="${association.targetMultiplicity}"/>\n`;
      });
      
      xml += '  </Relaciones>\n';
    }
    
    xml += '</Schema>';
  } else if (umlModel.classes.size > 0) {
    // Si no hay raíz clara, usar la primera clase
    const firstClass = Array.from(umlModel.classes.values())[0];
    xml += `<Schema nombre="${firstClass.name}">\n`;
    
    umlModel.classes.forEach((classObj) => {
      xml += generateClassXml(classObj, umlModel, 1);
    });
    
    xml += '</Schema>';
  } else {
    xml += '<Schema nombre="EmptySchema">\n';
    xml += '  <!-- No se encontraron clases en el diagrama -->\n';
    xml += '</Schema>';
  }
  
  return xml;
};

// Generar XML para una clase específica
const generateClassXml = (classObj, umlModel, indentLevel = 0) => {
  const indent = '  '.repeat(indentLevel);
  let xml = '';
  
  xml += `${indent}<Clase nombre="${classObj.name}" id="${classObj.id}">\n`;
  
  // Atributos
  if (classObj.attributes && classObj.attributes.length > 0) {
    xml += `${indent}  <Atributos>\n`;
    classObj.attributes.forEach(attr => {
      xml += `${indent}    <Atributo nombre="${attr.name}" tipo="${attr.type}" `;
      xml += `visibilidad="${attr.visibility}"/>\n`;
    });
    xml += `${indent}  </Atributos>\n`;
  } else {
    xml += `${indent}  <Atributos/>\n`;
  }
  
  // Métodos
  if (classObj.methods && classObj.methods.length > 0) {
    xml += `${indent}  <Metodos>\n`;
    classObj.methods.forEach(method => {
      xml += `${indent}    <Metodo nombre="${method.name}" `;
      xml += `tipoRetorno="${method.returnType}" `;
      xml += `visibilidad="${method.visibility}"/>\n`;
    });
    xml += `${indent}  </Metodos>\n`;
  } else {
    xml += `${indent}  <Metodos/>\n`;
  }
  
  xml += `${indent}</Clase>\n`;
  
  return xml;
};

// Encontrar elemento raíz (clase con menos dependencias)
const findRootElement = (umlModel) => {
  if (umlModel.classes.size === 0) return null;
  
  let rootClass = null;
  let minDependencies = Infinity;
  
  umlModel.classes.forEach((classObj) => {
    const dependencies = countDependencies(classObj.name, umlModel);
    if (dependencies < minDependencies) {
      minDependencies = dependencies;
      rootClass = classObj;
    }
  });
  
  return rootClass;
};

// Contar dependencias de una clase
const countDependencies = (className, umlModel) => {
  let count = 0;
  
  // Contar herencias donde es padre
  count += umlModel.inheritances.filter(inheritance => 
    inheritance.parent === className
  ).length;
  
  // Contar asociaciones
  count += umlModel.associations.filter(association =>
    association.source === className || association.target === className
  ).length;
  
  return count;
};