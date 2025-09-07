'use client';

import React from 'react';

interface NutrientData {
  name: string;
  consumed: number;
  total: number;
  unit: string;
  color: string;
}

interface NutritionProgressProps {
  nutrients: NutrientData[];
}

export const NutritionProgress: React.FC<NutritionProgressProps> = ({ nutrients }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100">
      <div className="space-y-4">
        {nutrients.map((nutrient, index) => {
          const percentage = Math.min((nutrient.consumed / nutrient.total) * 100, 100);
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {nutrient.name}
                </span>
                <span className="text-sm text-gray-600">
                  {nutrient.consumed}/{nutrient.total}{nutrient.unit}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${nutrient.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};