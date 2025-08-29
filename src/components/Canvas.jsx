import React, { useRef } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import useMeasure from 'react-use-measure';
import { motion } from 'framer-motion';

export default function Canvas({ roofShape = [], obstacles = [], panels = [] }) {
  const [ref, bounds] = useMeasure();
  const stageRef = useRef();

  // Çatı sınırlarını al
  const xs = roofShape.map(p => p.x);
  const ys = roofShape.map(p => p.y);
  const roofWidth = Math.max(...xs) - Math.min(...xs);
  const roofHeight = Math.max(...ys) - Math.min(...ys);

  // Ölçek faktörü (container oranına göre)
  const scaleX = bounds.width / (roofWidth || 1);
  const scaleY = bounds.height / (roofHeight || 1);
  const scale = Math.min(scaleX, scaleY);
  const MotionDiv = motion.div;



  return (
    <motion.div
      ref={ref}
      className="relative w-full"
      style={{ paddingBottom: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Stage
        ref={stageRef}
        width={(roofWidth || 1) * scale}
        height={(roofHeight || 1) * scale}
        scaleX={scale}
        scaleY={scale}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <Layer>
          {/* Çatı konturu */}
          <Line
            points={roofShape.flatMap(p => [p.x, p.y])}
            closed
            stroke="white"
            strokeWidth={2}
          />

          {/* Engeller */}
          {obstacles.map((o, i) => (
            <Rect
              key={`obs-${i}`}
              x={o.x}
              y={o.y}
              width={o.width}
              height={o.height}
              stroke="red"
              strokeWidth={2}
              fill="rgba(255,0,0,0.3)"
              shadowBlur={5}
              shadowColor="black"
            />
          ))}

          {/* Paneller */}
          {panels.map((p, i) => (
            <Rect
              key={`panel-${i}`}
              x={p.x}
              y={p.y}
              width={p.width}
              height={p.height}
              fill="blue"
              opacity={0.7}
              onMouseEnter={e =>
                e.target.to({
                  opacity: 1,
                  scaleX: 1.02,
                  scaleY: 1.02,
                  duration: 0.1,
                })
              }
              onMouseLeave={e =>
                e.target.to({
                  opacity: 0.7,
                  scaleX: 1,
                  scaleY: 1,
                  duration: 0.1,
                })
              }
            />
          ))}
        </Layer>
      </Stage>
    </motion.div>
  );
}
