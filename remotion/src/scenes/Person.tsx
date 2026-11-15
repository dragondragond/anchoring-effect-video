import React from 'react';

/** 线稿小人（来自 10.18 Door.tsx）：x,y 为脚底中心 */
export const Person: React.FC<{x: number; y: number; k: number; color: string; step?: number; opacity?: number}> = ({x, y, k, color, step = 0, opacity = 1}) => {
  const sw = Math.sin(step) * 12;
  return (
    <g transform={`translate(${x},${y}) scale(${k})`} opacity={opacity}>
      <line x1={-11} y1={-64} x2={-11 - sw} y2={0} stroke={color} strokeWidth={10} strokeLinecap="round" />
      <line x1={11} y1={-64} x2={11 + sw} y2={0} stroke={color} strokeWidth={10} strokeLinecap="round" />
      <rect x={-27} y={-152} width={54} height={98} rx={25} fill={color} />
      <circle cx={0} cy={-174} r={21} fill={color} />
    </g>
  );
};
