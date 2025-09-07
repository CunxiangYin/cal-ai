'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FoodRecord {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  mealType: string;
  healthStatus?: 'good' | 'moderate' | 'caution';
  icon?: string;
}

interface FoodRecordListProps {
  records: FoodRecord[];
  date: string;
  onDelete?: (id: string) => void;
  onEdit?: (record: FoodRecord) => void;
}

const mealTypeLabels: { [key: string]: string } = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const mealTypeColors: { [key: string]: string } = {
  breakfast: 'bg-yellow-100 text-yellow-800',
  lunch: 'bg-blue-100 text-blue-800',
  dinner: 'bg-purple-100 text-purple-800',
  snack: 'bg-green-100 text-green-800',
};

const healthStatusConfig = {
  good: {
    label: '健康食品',
    color: 'bg-green-50 text-green-700',
    dotColor: 'bg-green-500',
  },
  moderate: {
    label: '适量食用',
    color: 'bg-yellow-50 text-yellow-700',
    dotColor: 'bg-yellow-500',
  },
  caution: {
    label: '少量食用',
    color: 'bg-red-50 text-red-700',
    dotColor: 'bg-red-500',
  },
};

export const FoodRecordList: React.FC<FoodRecordListProps> = ({ 
  records, 
  date, 
  onDelete,
  onEdit 
}) => {
  // Group records by meal type
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.mealType]) {
      acc[record.mealType] = [];
    }
    acc[record.mealType].push(record);
    return acc;
  }, {} as { [key: string]: FoodRecord[] });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">今日记录</h3>
        <span className="text-sm text-gray-500">{date}</span>
      </div>

      {Object.entries(groupedRecords).map(([mealType, mealRecords]) => (
        <div key={mealType} className="space-y-2">
          {/* Meal Type Header */}
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${mealTypeColors[mealType]}`}>
              {mealTypeLabels[mealType]}
            </Badge>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Food Items */}
          <div className="space-y-2">
            {mealRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Food Icon */}
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{record.icon || '🍽️'}</span>
                  </div>

                  {/* Food Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {record.name}
                      </span>
                      {record.healthStatus && (
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              healthStatusConfig[record.healthStatus].dotColor
                            }`}
                          />
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              healthStatusConfig[record.healthStatus].color
                            }`}
                          >
                            {healthStatusConfig[record.healthStatus].label}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {record.amount}{record.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calories and Actions */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {record.calories}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">kcal</span>
                  </div>
                  
                  {(onDelete || onEdit) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(record)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(record.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {records.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">暂无饮食记录</p>
          <p className="text-xs mt-1">点击&quot;+&quot;按钮添加记录</p>
        </div>
      )}
    </div>
  );
};