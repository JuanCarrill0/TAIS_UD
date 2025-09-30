import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

const MermaidDiagram = () => {
  const ref = useRef(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  return (
    <div ref={ref} className="mermaid">
      {`
        classDiagram
          class Animal {
            +String name
            +int age
            +eat()
          }
          class Dog {
            +bark()
          }
          class Cat {
            +meow()
          }
          Animal <|-- Dog
          Animal <|-- Cat
      `}
    </div>
  );
};

export default MermaidDiagram;