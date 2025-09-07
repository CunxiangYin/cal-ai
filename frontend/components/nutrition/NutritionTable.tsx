'use client';

import React from 'react';
import { NutritionInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface NutritionTableProps {
  data: NutritionInfo;
}

export const NutritionTable: React.FC<NutritionTableProps> = ({ data }) => {
  return (
    <Card className="p-4 bg-white shadow-sm">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
          <Flame className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-xs text-gray-600">总热量</p>
            <p className="text-sm font-semibold text-gray-900">{data.calories} 千卡</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <Beef className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-xs text-gray-600">蛋白质</p>
            <p className="text-sm font-semibold text-gray-900">{data.protein}g</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
          <Wheat className="h-4 w-4 text-amber-600" />
          <div>
            <p className="text-xs text-gray-600">碳水</p>
            <p className="text-sm font-semibold text-gray-900">{data.carbs}g</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
          <Droplet className="h-4 w-4 text-yellow-600" />
          <div>
            <p className="text-xs text-gray-600">脂肪</p>
            <p className="text-sm font-semibold text-gray-900">{data.fat}g</p>
          </div>
        </div>
      </div>

      {/* Food Items Table */}
      {data.items && data.items.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">食物明细</h4>
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="font-medium">食物</TableHead>
                <TableHead className="font-medium">份量</TableHead>
                <TableHead className="font-medium text-right">热量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => (
                <TableRow key={index} className="text-xs">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-normal">
                      {item.calories} 千卡
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};