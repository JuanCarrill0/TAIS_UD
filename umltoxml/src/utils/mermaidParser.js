// utils/mermaidParser.js - VERSIÓN CORREGIDA

export class UmlModel {
  constructor() {
    this.classes = new Map();
    this.associations = [];
    this.inheritances = [];
    this.realizations = []; // Para relaciones de realización
  }

  addClass(className, attributes = [], methods = [], stereotype = null) {
    const id = className.toLowerCase();
    this.classes.set(id, {
      name: className,
      attributes: Array.isArray(attributes) ? attributes.map(attr => this.parseAttribute(attr)) : [],
      methods: Array.isArray(methods) ? methods.map(method => this.parseMethod(method)) : [],
      stereotype: stereotype,
      id
    });
  }

  addAssociation(source, target, sourceMultiplicity, targetMultiplicity) {
    this.associations.push({
      source: source.toLowerCase(),
      target: target.toLowerCase(),
      sourceMultiplicity: sourceMultiplicity || '1',
      targetMultiplicity: targetMultiplicity || '1',
      type: 'association'
    });
  }

  addInheritance(parent, child) {
    this.inheritances.push({
      parent: parent.toLowerCase(),
      child: child.toLowerCase(),
      type: 'inheritance'
    });
  }

  // CORREGIDO: Cambié 'interface' por 'interfaceName' para evitar palabra reservada
  addRealization(interfaceName, implementer) {
    this.realizations.push({
      interface: interfaceName.toLowerCase(),
      implementer: implementer.toLowerCase(),
      type: 'realization'
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
  let classContentBuffer = [];
  let currentStereotype = null;

  for (const line of lines) {
    if (line.startsWith('classDiagram')) {
      currentSection = 'classDiagram';
      continue;
    }

    if (currentSection === 'classDiagram') {
      // Detectar estereotipos en líneas de clase
      const stereotypeMatch = line.match(/class\s+(\w+)\s*\{\s*<<(abstract|interface)>>/);
      if (stereotypeMatch) {
        currentClass = stereotypeMatch[1];
        currentStereotype = stereotypeMatch[2];
        readingClassContent = true;
        classContentBuffer = [];
        continue;
      }

      // Parsear definición de clase normal
      if (line.startsWith('class ')) {
        const classMatch = line.match(/class\s+(\w+)\s*\{?/);
        if (classMatch) {
          currentClass = classMatch[1];
          currentStereotype = null;
          classContentBuffer = [];
          if (line.includes('{')) {
            readingClassContent = true;
          } else {
            model.addClass(currentClass, [], [], currentStereotype);
            currentClass = null;
            currentStereotype = null;
          }
        }
      }
      
      // Parsear contenido de clase
      else if (readingClassContent && currentClass) {
        if (line.includes('}')) {
          const attributes = [];
          const methods = [];
          classContentBuffer.forEach(item => {
            if (item.includes('(') && item.includes(')')) {
              methods.push(item);
            } else if (item.trim() && !item.includes('<<')) {
              attributes.push(item);
            }
          });
          model.addClass(currentClass, attributes, methods, currentStereotype);
          readingClassContent = false;
          currentClass = null;
          currentStereotype = null;
          classContentBuffer = [];
        } else if (!line.includes('<<')) {
          classContentBuffer.push(line);
        }
      }
      
      // Parsear herencia
      else if (line.includes('<|--')) {
        const inheritanceMatch = line.match(/(\w+)\s*<\|--\s*(\w+)/);
        if (inheritanceMatch) {
          model.addInheritance(inheritanceMatch[1], inheritanceMatch[2]);
          if (!model.classes.has(inheritanceMatch[1].toLowerCase())) {
            model.addClass(inheritanceMatch[1], [], []);
          }
          if (!model.classes.has(inheritanceMatch[2].toLowerCase())) {
            model.addClass(inheritanceMatch[2], [], []);
          }
        }
      }
      
      // Parsear relaciones de realización (..|>)
      else if (line.includes('..|>')) {
        const realizationMatch = line.match(/(\w+)\s*\.\.\|\>\s*(\w+)/);
        if (realizationMatch) {
          model.addRealization(realizationMatch[2], realizationMatch[1]);
          if (!model.classes.has(realizationMatch[1].toLowerCase())) {
            model.addClass(realizationMatch[1], [], []);
          }
          if (!model.classes.has(realizationMatch[2].toLowerCase())) {
            model.addClass(realizationMatch[2], [], []);
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
          if (!model.classes.has(association.source.toLowerCase())) {
            model.addClass(association.source, [], []);
          }
          if (!model.classes.has(association.target.toLowerCase())) {
            model.addClass(association.target, [], []);
          }
        }
      }
    }
  }

  // Procesar bloques de clases con contenido completo
  processClassContent(mermaidCode, model);

  return {
    classes: Array.from(model.classes.values()),
    associations: model.associations,
    inheritances: model.inheritances,
    realizations: model.realizations
  };
};

// Procesar contenido completo de clases
const processClassContent = (mermaidCode, model) => {
  // Buscar clases con estereotipos
  const stereotypeBlocks = mermaidCode.match(/class\s+\w+\s*\{\s*<<(abstract|interface)>>[^}]+\}/g) || [];
  
  stereotypeBlocks.forEach(block => {
    const classMatch = block.match(/class\s+(\w+)/);
    const stereotypeMatch = block.match(/<<(abstract|interface)>>/);
    
    if (classMatch && stereotypeMatch) {
      const className = classMatch[1];
      const stereotype = stereotypeMatch[1];
      const content = block.match(/\{([^}]+)\}/);
      
      if (content) {
        const lines = content[1].split('\n').map(line => line.trim()).filter(line => line && !line.includes('<<'));
        const attributes = [];
        const methods = [];
        
        lines.forEach(line => {
          if (line.includes('(') && line.includes(')')) {
            methods.push(line);
          } else if (line.trim()) {
            attributes.push(line);
          }
        });
        
        model.addClass(className, attributes, methods, stereotype);
      }
    }
  });

  // Procesar clases normales (sin estereotipos)
  const normalBlocks = mermaidCode.match(/class\s+\w+\s*\{[^}]*\}/g) || [];
  
  normalBlocks.forEach(block => {
    if (block.includes('<<')) return;
    
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
        
        if (!model.classes.has(className.toLowerCase())) {
          model.addClass(className, attributes, methods, null);
        }
      }
    }
  });
};

// Parsear línea de asociación
const parseAssociation = (line) => {
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