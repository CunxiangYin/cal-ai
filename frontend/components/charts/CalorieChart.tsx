'use client';

import React from 'react';

interface DataPoint {
  date: string;
  calories: number;
  goal: number;
}

interface CalorieChartProps {
  data: DataPoint[];
  height?: number;
}

export const CalorieChart: React.FC<CalorieChartProps> = ({ data, height = 200 }) => {
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => Math.max(d.calories, d.goal)));
  const scaleY = (value: number) => {
    return height - (value / maxValue) * (height - 40);
  };

  // Calculate bar width
  const barWidth = Math.floor((100 / data.length) - 2);

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
        <span>{maxValue}</span>
        <span>{Math.round(maxValue / 2)}</span>
        <span>0</span>
      </div>

      {/* Chart area */}
      <div className="ml-10 h-full relative">
        {/* Goal line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
          style={{ top: scaleY(data[0]?.goal || 1800) }}
        >
          <span className="absolute -top-2.5 right-0 text-xs text-gray-500 bg-white px-1">
            目标
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-around h-full pb-8">
          {data.map((point, index) => {
            const barHeight = (point.calories / maxValue) * (height - 40);
            const isOverGoal = point.calories > point.goal;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ width: `${barWidth}%` }}
              >
                {/* Bar */}
                <div className="w-full flex flex-col justify-end" style={{ height: height - 40 }}>
                  <div
                    className={`rounded-t transition-all duration-300 ${
                      isOverGoal ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ height: barHeight }}
                  >
                    {/* Value label */}
                    <div className="text-xs text-white text-center pt-1">
                      {point.calories > 0 && point.calories}
                    </div>
                  </div>
                </div>

                {/* Date label */}
                <div className="text-xs text-gray-600 mt-1 text-center">
                  {new Date(point.date).getDate()}日
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};