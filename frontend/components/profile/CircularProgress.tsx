'use client';

import React from 'react';

interface CircularProgressProps {
  consumed: number;
  total: number;
  remaining: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  consumed,
  total,
  remaining,
  size = 200,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min((consumed / total) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg
        className="absolute top-0 left-0 transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{consumed}</div>
          <div className="text-xs text-gray-500 mt-1">已摄入热量 Kcal</div>
        </div>
        
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">{total}</div>
            <div className="text-xs text-gray-500">总热量 Kcal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{remaining}</div>
            <div className="text-xs text-gray-500">剩余热量 Kcal</div>
          </div>
        </div>
      </div>
    </div>
  );
};