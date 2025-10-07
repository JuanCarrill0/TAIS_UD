// utils/xmlGenerator.js

// Generar XML basado en el modelo UML
export const generateXmlFromUml = (umlModel) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<xmi:XMI xmi:version="2.4.1"\n';
  xml += '    xmlns:xmi="http://www.omg.org/spec/XMI/20110701"\n';
  xml += '    xmlns:uml="http://www.eclipse.org/uml2/5.0.0/UML">\n';
  xml += '  <uml:Model xmi:id="_model_1" name="UMLModel">\n';

  // Clases
  umlModel.classes.forEach((classObj) => {
    xml += `    <packagedElement xmi:type="uml:Class" xmi:id="${classObj.id}" name="${classObj.name}">\n`;

    // Atributos
    if (classObj.attributes && classObj.attributes.length > 0) {
      classObj.attributes.forEach((attr, i) => {
        xml += `      <ownedAttribute xmi:id="${classObj.id}_attr${i}" name="${attr.name}" type="${attr.type}" visibility="${attr.visibility}" />\n`;
      });
    }

    // Métodos
    if (classObj.methods && classObj.methods.length > 0) {
      classObj.methods.forEach((method, i) => {
        xml += `      <ownedOperation xmi:id="${classObj.id}_op${i}" name="${method.name}" visibility="${method.visibility}" />\n`;
      });
    }

    // Herencia (Generalization) dentro de la clase
    if (umlModel.inheritances && umlModel.inheritances.length > 0) {
      umlModel.inheritances.forEach((inheritance, i) => {
        if (inheritance.child === classObj.id) {
          xml += `      <generalization xmi:id="gen${i}" general="${inheritance.parent}" />\n`;
        }
      });
    }

    xml += '    </packagedElement>\n';
  });

  xml += '  </uml:Model>\n';
  xml += '</xmi:XMI>\n';
  return xml;
};

