// utils/dtdGenerator.js

// Generar DTD basado en el modelo UML
export const generateDtdFromUml = (umlModel) => {
  let dtd = `<!-- DTD generado automáticamente desde UML. Reglas del artículo aplicadas. -->\n`;
  dtd += `<!DOCTYPE Schema [\n\n`;

  // 1. Elemento raíz
  dtd += `  <!-- 1. Cada clase UML se transforma en un elemento DTD -->\n`;
  dtd += `  <!ELEMENT Schema (`;
  dtd += umlModel.classes.map(c => c.name).join(', ');
  if (umlModel.inheritances.length > 0 || umlModel.associations.length > 0) {
    dtd += ', Relaciones';
  }
  dtd += ')>\n\n';

  // 2. Clases y atributos
  umlModel.classes.forEach((classObj) => {
    dtd += `  <!-- Definición para la clase ${classObj.name} -->\n`;
    // Como subelementos (regla 2)
    if (classObj.attributes.length > 0) {
      dtd += `  <!ELEMENT ${classObj.name} (${classObj.attributes.map(a => a.name).join(', ')}${classObj.methods.length > 0 ? ', ' + classObj.methods.map(m => m.name).join(', ') : ''})>\n`;
    } else if (classObj.methods.length > 0) {
      dtd += `  <!ELEMENT ${classObj.name} (${classObj.methods.map(m => m.name).join(', ')})>\n`;
    } else {
      dtd += `  <!ELEMENT ${classObj.name} EMPTY>\n`;
    }
    // Como atributos (alternativa regla 2)
    classObj.attributes.forEach(attr => {
      dtd += `  <!ELEMENT ${attr.name} (#PCDATA)>\n`;
    });
    // Métodos como subelementos
    classObj.methods.forEach(method => {
      dtd += `  <!ELEMENT ${method.name} (#PCDATA)>\n`;
    });
    dtd += '\n';
  });

  // 3. Asociaciones como subelementos
  if (umlModel.associations.length > 0 || umlModel.inheritances.length > 0) {
    dtd += `  <!-- 3. Asociaciones y 5. Herencias como subelementos -->\n`;
    dtd += `  <!ELEMENT Relaciones (Herencia|Asociacion)*>\n\n`;
  }

  // 4. Multiplicidades con operadores DTD
  umlModel.associations.forEach((assoc, i) => {
    // Multiplicidad ejemplo: * => *, 1 => '', 0..1 => ?
    let multOrigen = assoc.sourceMultiplicity === '*' ? '*' : (assoc.sourceMultiplicity === '0..1' ? '?' : '');
    let multDestino = assoc.targetMultiplicity === '*' ? '*' : (assoc.targetMultiplicity === '0..1' ? '?' : '');
    dtd += `  <!ELEMENT Asociacion${i} (${assoc.source}${multOrigen}, ${assoc.target}${multDestino})>\n`;
    dtd += `  <!ATTLIST Asociacion${i}\n    origen IDREF #REQUIRED\n    destino IDREF #REQUIRED\n    multiplicidadOrigen CDATA #IMPLIED\n    multiplicidadDestino CDATA #IMPLIED\n  >\n\n`;
  });

  // 5. Herencia como elemento separado
  umlModel.inheritances.forEach((her, i) => {
    dtd += `  <!ELEMENT Herencia${i} EMPTY>\n`;
    dtd += `  <!ATTLIST Herencia${i}\n    padre IDREF #REQUIRED\n    hija IDREF #REQUIRED\n  >\n\n`;
  });

  // 6. Clases asociativas (muchos a muchos)
  if (umlModel.associatives && umlModel.associatives.length > 0) {
    umlModel.associatives.forEach((assocClass) => {
      dtd += `  <!ELEMENT ${assocClass.name} (${assocClass.references.join(', ')})>\n`;
      assocClass.references.forEach(ref => {
        dtd += `  <!ELEMENT ${ref} (#PCDATA)>\n`;
      });
      dtd += '\n';
    });
  }

  // 7. Restricciones como comentarios
  if (umlModel.constraints && umlModel.constraints.length > 0) {
    dtd += `  <!-- 7. Restricciones adicionales -->\n`;
    umlModel.constraints.forEach(constraint => {
      dtd += `  <!-- ${constraint} -->\n`;
    });
    dtd += '\n';
  }

  dtd += `]>`;

  return dtd;
};