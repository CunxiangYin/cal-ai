'use client';

import React from 'react';

interface NutritionData {
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionPieChartProps {
  data: NutritionData;
  size?: number;
}

export const NutritionPieChart: React.FC<NutritionPieChartProps> = ({ 
  data, 
  size = 200 
}) => {
  const total = data.protein + data.carbs + data.fat;
  
  if (total === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-full"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-400 text-sm">暂无数据</p>
      </div>
    );
  }

  // Calculate percentages
  const proteinPercent = (data.protein / total) * 100;
  const carbsPercent = (data.carbs / total) * 100;
  const fatPercent = (data.fat / total) * 100;

  // Calculate angles for pie chart
  const proteinAngle = (proteinPercent / 100) * 360;
  const carbsAngle = (carbsPercent / 100) * 360;

  // Create SVG path for each segment
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  const createPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius - 10, endAngle);
    const end = polarToCartesian(centerX, centerY, radius - 10, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius - 10, radius - 10, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Protein segment */}
        <path
          d={createPath(0, proteinAngle)}
          fill="#10B981"
          className="transition-all duration-300 hover:opacity-80"
        />
        
        {/* Carbs segment */}
        <path
          d={createPath(proteinAngle, proteinAngle + carbsAngle)}
          fill="#3B82F6"
          className="transition-all duration-300 hover:opacity-80"
        />
        
        {/* Fat segment */}
        <path
          d={createPath(proteinAngle + carbsAngle, 360)}
          fill="#F59E0B"
          className="transition-all duration-300 hover:opacity-80"
        />

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - 50}
          fill="white"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{total}g</p>
          <p className="text-xs text-gray-500">总营养</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>蛋白质 {proteinPercent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>碳水 {carbsPercent.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>脂肪 {fatPercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};