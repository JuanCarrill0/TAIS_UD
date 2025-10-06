// utils/mermaidParser.js

// Modelo para representar el UML parseado
export class UmlModel {
  constructor() {
    this.classes = new Map();
    this.associations = [];
    this.inheritances = [];
  }

  addClass(className, attributes = [], methods = []) {
    this.classes.set(className, {
      name: className,
      attributes: attributes.map(attr => this.parseAttribute(attr)),
      methods: methods.map(method => this.parseMethod(method)),
      id: className.toLowerCase()
    });
  }

  addAssociation(source, target, sourceMultiplicity, targetMultiplicity) {
    this.associations.push({
      source,
      target,
      sourceMultiplicity: sourceMultiplicity || '1',
      targetMultiplicity: targetMultiplicity || '1',
      type: 'association'
    });
  }

  addInheritance(parent, child) {
    this.inheritances.push({
      parent,
      child,
      type: 'inheritance'
    });
  }

  parseAttribute(attrString) {
    const match = attrString.match(/^([+-])(\w+)\s+(\w+)$/);
    if (match) {
      return {
        visibility: match[1] === '+' ? 'public' : 'private',
        name: match[3],
        type: match[2]
      };
    }
    return {
      visibility: 'public',
      name: attrString.trim(),
      type: 'string'
    };
  }

  parseMethod(methodString) {
    const match = methodString.match(/^([+-])(\w+)\(\)\s+(\w+)$/);
    if (match) {
      return {
        visibility: match[1] === '+' ? 'public' : 'private',
        name: match[2],
        returnType: match[3]
      };
    }
    return {
      visibility: 'public',
      name: methodString.trim(),
      returnType: 'void'
    };
  }
}

// Parser principal de Mermaid a UML
export const parseMermaidToUmlModel = (mermaidCode) => {
  const model = new UmlModel();
  const lines = mermaidCode.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentSection = null;
  let currentClass = null;
  let readingClassContent = false;

  for (const line of lines) {
    if (line.startsWith('classDiagram')) {
      currentSection = 'classDiagram';
      continue;
    }

    if (currentSection === 'classDiagram') {
      // Parsear definición de clase
      if (line.startsWith('class ')) {
        readingClassContent = false;
        const classMatch = line.match(/class\s+(\w+)\s*\{?/);
        if (classMatch) {
          currentClass = classMatch[1];
          // Verificar si la línea tiene {
          if (line.includes('{')) {
            readingClassContent = true;
          } else {
            model.addClass(currentClass, [], []);
          }
        }
      }
      // Parsear contenido de clase
      else if (readingClassContent && currentClass) {
        if (line.includes('}')) {
          readingClassContent = false;
          currentClass = null;
        } else {
          // Aquí procesaríamos atributos y métodos
          // Por simplicidad, agregamos la clase vacía por ahora
        }
      }
      // Parsear herencia
      else if (line.includes('<|--')) {
        const inheritanceMatch = line.match(/(\w+)\s*<\|--\s*(\w+)/);
        if (inheritanceMatch) {
          model.addInheritance(inheritanceMatch[1], inheritanceMatch[2]);
          // Asegurarse de que las clases existan en el modelo
          if (!model.classes.has(inheritanceMatch[1])) {
            model.addClass(inheritanceMatch[1]);
          }
          if (!model.classes.has(inheritanceMatch[2])) {
            model.addClass(inheritanceMatch[2]);
          }
        }
      }
      // Parsear asociaciones
      else if (line.includes('--') || line.includes('-->')) {
        const association = parseAssociation(line);
        if (association) {
          model.addAssociation(
            association.source,
            association.target,
            association.sourceMultiplicity,
            association.targetMultiplicity
          );
          // Asegurarse de que las clases existan
          if (!model.classes.has(association.source)) {
            model.addClass(association.source);
          }
          if (!model.classes.has(association.target)) {
            model.addClass(association.target);
          }
        }
      }
    }
  }

  // Procesar clases con contenido completo
  processClassContent(mermaidCode, model);

  return model;
};

// Procesar contenido completo de clases
const processClassContent = (mermaidCode, model) => {
  const classBlocks = mermaidCode.match(/class\s+\w+\s*\{[^}]+\}/g) || [];
  
  classBlocks.forEach(block => {
    const classMatch = block.match(/class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      const content = block.match(/\{([^}]+)\}/);
      
      if (content) {
        const lines = content[1].split('\n').map(line => line.trim()).filter(line => line);
        const attributes = [];
        const methods = [];
        
        lines.forEach(line => {
          if (line.includes('(') && line.includes(')')) {
            methods.push(line);
          } else if (line.trim()) {
            attributes.push(line);
          }
        });
        
        model.addClass(className, attributes, methods);
      }
    }
  });
};

// Parsear línea de asociación
const parseAssociation = (line) => {
  // Patrón básico para asociaciones simples
  const simplePattern = /(\w+)\s*--\s*(\w+)/;
  const simpleMatch = line.match(simplePattern);
  
  if (simpleMatch) {
    return {
      source: simpleMatch[1],
      target: simpleMatch[2],
      sourceMultiplicity: '1',
      targetMultiplicity: '1'
    };
  }
  
  // Patrón para asociaciones con multiplicidad
  const multiPattern = /(\w+)\s*"([^"]*)"\s*-->\s*"([^"]*)"\s*(\w+)/;
  const multiMatch = line.match(multiPattern);
  
  if (multiMatch) {
    return {
      source: multiMatch[1],
      target: multiMatch[4],
      sourceMultiplicity: multiMatch[2],
      targetMultiplicity: multiMatch[3]
    };
  }

  return null;
};