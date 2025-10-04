// utils/dtdGenerator.js

// Generar DTD basado en el modelo UML
export const generateDtdFromUml = (umlModel) => {
  let dtd = `<!-- DTD Generado automáticamente desde diagrama UML -->\n`;
  dtd += `<!-- Implementa el mecanismo con apuntadores del artículo -->\n\n`;
  dtd += `<!DOCTYPE Schema [\n\n`;
  
  // Elemento raíz
  dtd += `  <!-- Elemento raíz del esquema -->\n`;
  dtd += `  <!ELEMENT Schema (Clase+, Relaciones?)>\n`;
  dtd += `  <!ATTLIST Schema nombre CDATA #REQUIRED>\n\n`;
  
  // Elementos para cada clase
  umlModel.classes.forEach((classObj) => {
    dtd += generateClassDtd(classObj, umlModel);
  });
  
  // Elementos para relaciones
  dtd += generateRelationshipsDtd(umlModel);
  
  dtd += `]>`;
  
  return dtd;
};

// Generar DTD para una clase
const generateClassDtd = (classObj, umlModel) => {
  let dtd = '';
  
  dtd += `  <!-- Definición para la clase ${classObj.name} -->\n`;
  
  // Elemento Clase
  dtd += `  <!ELEMENT Clase (Atributos?, Metodos?)>\n`;
  dtd += `  <!ATTLIST Clase\n`;
  dtd += `    nombre CDATA #REQUIRED\n`;
  dtd += `    id ID #REQUIRED\n`;
  dtd += `  >\n\n`;
  
  // Atributos
  dtd += `  <!ELEMENT Atributos (Atributo+)>\n`;
  dtd += `  <!ELEMENT Atributo EMPTY>\n`;
  dtd += `  <!ATTLIST Atributo\n`;
  dtd += `    nombre CDATA #REQUIRED\n`;
  dtd += `    tipo CDATA #REQUIRED\n`;
  dtd += `    visibilidad (public|private) #IMPLIED\n`;
  dtd += `  >\n\n`;
  
  // Métodos
  dtd += `  <!ELEMENT Metodos (Metodo+)>\n`;
  dtd += `  <!ELEMENT Metodo EMPTY>\n`;
  dtd += `  <!ATTLIST Metodo\n`;
  dtd += `    nombre CDATA #REQUIRED\n`;
  dtd += `    tipoRetorno CDATA #IMPLIED\n`;
  dtd += `    visibilidad (public|private) #IMPLIED\n`;
  dtd += `  >\n\n`;
  
  return dtd;
};

// Generar DTD para relaciones
const generateRelationshipsDtd = (umlModel) => {
  let dtd = '';
  
  if (umlModel.inheritances.length > 0 || umlModel.associations.length > 0) {
    dtd += `  <!-- Definiciones para relaciones -->\n`;
    dtd += `  <!ELEMENT Relaciones (Herencia|Asociacion)*>\n\n`;
    
    // Herencia
    if (umlModel.inheritances.length > 0) {
      dtd += `  <!ELEMENT Herencia EMPTY>\n`;
      dtd += `  <!ATTLIST Herencia\n`;
      dtd += `    padre IDREF #REQUIRED\n`;
      dtd += `    hija IDREF #REQUIRED\n`;
      dtd += `  >\n\n`;
    }
    
    // Asociaciones
    if (umlModel.associations.length > 0) {
      dtd += `  <!ELEMENT Asociacion EMPTY>\n`;
      dtd += `  <!ATTLIST Asociacion\n`;
      dtd += `    origen IDREF #REQUIRED\n`;
      dtd += `    destino IDREF #REQUIRED\n`;
      dtd += `    multiplicidadOrigen CDATA #IMPLIED\n`;
      dtd += `    multiplicidadDestino CDATA #IMPLIED\n`;
      dtd += `  >\n\n`;
    }
    
    // Elementos de apuntador para implementar el mecanismo del artículo
    dtd += `  <!-- Elementos de apuntador para referencias -->\n`;
    umlModel.classes.forEach((classObj) => {
      dtd += `  <!ELEMENT ap${classObj.name} EMPTY>\n`;
      dtd += `  <!ATTLIST ap${classObj.name}\n`;
      dtd += `    point IDREF #REQUIRED\n`;
      dtd += `  >\n\n`;
    });
  }
  
  return dtd;
};