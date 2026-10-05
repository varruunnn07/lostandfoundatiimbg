import React, { useEffect } from 'react';

const BackgroundShapes: React.FC = () => {
  useEffect(() => {
    const shapes = document.querySelectorAll('.shape') as NodeListOf<HTMLElement>;
    
    const handleMouseMove = (e: MouseEvent) => {
      shapes.forEach((shape, index) => {
        const speed = (index + 1) * 20;
        const xOffset = ((window.innerWidth / 2) - e.clientX) * speed / 1000;
        const yOffset = ((window.innerHeight / 2) - e.clientY) * speed / 1000;
        
        shape.style.transform = `translate(${xOffset}px, ${yOffset}px) ${index === 3 ? 'rotate(45deg)' : ''}`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="background-shapes">
      <div className="shape shape-1"></div>
      <div className="shape shape-2"></div>
      <div className="shape shape-3"></div>
      <div className="shape shape-4"></div>
    </div>
  );
};

export default BackgroundShapes;
