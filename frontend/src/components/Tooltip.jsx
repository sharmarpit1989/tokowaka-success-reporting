/**
 * Smart Tooltip Component
 * Automatically positions itself to avoid viewport edges
 * Uses Portal to render outside parent containers
 */

import { Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

function Tooltip({ children, content, maxWidth = 'max-w-xs' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const [arrowPosition, setArrowPosition] = useState('left');
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle showing tooltip
  const handleShow = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsVisible(true);
  };

  // Handle hiding tooltip with delay
  const handleHide = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay to allow mouse to move to tooltip
  };

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 16;
      const spacing = 8;

      let left, top;
      let arrowPos = 'left';

      // Try right side first
      const rightPosition = triggerRect.right + spacing;
      const fitsRight = rightPosition + tooltipRect.width + margin < viewportWidth;

      if (fitsRight) {
        // Position on right
        left = rightPosition;
        arrowPos = 'left';
      } else {
        // Position on left
        left = triggerRect.left - tooltipRect.width - spacing;
        arrowPos = 'right';
      }

      // Vertical positioning - try to center, but adjust if needed
      let centeredTop = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
      
      // Ensure tooltip doesn't go above viewport
      if (centeredTop < margin) {
        centeredTop = margin;
      }
      
      // Ensure tooltip doesn't go below viewport
      if (centeredTop + tooltipRect.height + margin > viewportHeight) {
        centeredTop = viewportHeight - tooltipRect.height - margin;
      }

      top = centeredTop;

      // Arrow position (vertically) - point to center of trigger
      const arrowTop = triggerRect.top + (triggerRect.height / 2) - centeredTop;

      setTooltipStyle({ left: `${left}px`, top: `${top}px` });
      setArrowStyle({ top: `${arrowTop}px` });
      setArrowPosition(arrowPos);
    }
  }, [isVisible]);

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      className={`
        fixed ${maxWidth} p-3 
        bg-gray-900 text-white text-xs rounded-lg shadow-2xl
        transition-opacity duration-200 z-[9999]
        whitespace-normal
        cursor-auto select-text
      `}
    >
      {/* Arrow */}
      <div 
        style={arrowStyle}
        className={`
          absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1/2 pointer-events-none
          ${arrowPosition === 'left' ? '-left-1' : '-right-1'}
        `} 
      />
      
      {/* Content */}
      <div className="relative z-10">
        {typeof content === 'string' ? (
          <p className="leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="inline-flex items-center">
        <div
          ref={triggerRef}
          onMouseEnter={handleShow}
          onMouseLeave={handleHide}
          className="cursor-help inline-flex"
        >
          {children || <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />}
        </div>
      </div>
      
      {/* Render tooltip at document root to avoid overflow issues */}
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
}

export default Tooltip;
