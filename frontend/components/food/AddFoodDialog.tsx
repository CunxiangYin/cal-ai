'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FoodItem {
  id: string;
  name: string;
  defaultAmount: number;
  unit: string;
  caloriesPerUnit: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// 食物数据库
const foodDatabase: FoodItem[] = [
  { id: '1', name: '米饭', defaultAmount: 150, unit: 'g', caloriesPerUnit: 1.16, protein: 2.6, carbs: 25.9, fat: 0.3 },
  { id: '2', name: '清炒白菜', defaultAmount: 200, unit: 'g', caloriesPerUnit: 0.62, protein: 1.5, carbs: 3.2, fat: 0.2 },
  { id: '3', name: '番茄牛肉', defaultAmount: 200, unit: 'g', caloriesPerUnit: 1.3, protein: 15, carbs: 5, fat: 8 },
  { id: '4', name: '豆角炒平菇', defaultAmount: 200, unit: 'g', caloriesPerUnit: 0.7, protein: 2.5, carbs: 8, fat: 3 },
  { id: '5', name: '鸡蛋', defaultAmount: 50, unit: 'g', caloriesPerUnit: 1.55, protein: 13, carbs: 1.1, fat: 11 },
  { id: '6', name: '牛奶', defaultAmount: 250, unit: 'ml', caloriesPerUnit: 0.42, protein: 3.4, carbs: 5, fat: 3.2 },
  { id: '7', name: '苹果', defaultAmount: 200, unit: 'g', caloriesPerUnit: 0.52, protein: 0.3, carbs: 14, fat: 0.2 },
  { id: '8', name: '面包', defaultAmount: 100, unit: 'g', caloriesPerUnit: 2.65, protein: 9, carbs: 49, fat: 3.2 },
];

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFood: (food: {
    name: string;
    amount: number;
    unit: string;
    calories: number;
    mealType: string;
    date: string;
  }) => void;
}

export function AddFoodDialog({ open, onOpenChange, onAddFood }: AddFoodDialogProps) {
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(150);
  const [mealType, setMealType] = useState('dinner');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodSelect = (foodId: string) => {
    const food = foodDatabase.find(f => f.id === foodId);
    if (food) {
      setSelectedFood(food);
      setAmount(food.defaultAmount);
      setCustomFood(false);
    }
  };

  const handleAmountChange = (delta: number) => {
    const newAmount = Math.max(1, amount + delta);
    setAmount(newAmount);
  };

  const calculateCalories = () => {
    if (!selectedFood) return 0;
    return Math.round(amount * selectedFood.caloriesPerUnit);
  };

  const handleAdd = () => {
    if (!selectedFood) return;

    onAddFood({
      name: selectedFood.name,
      amount,
      unit: selectedFood.unit,
      calories: calculateCalories(),
      mealType,
      date: new Date().toLocaleDateString('zh-CN'),
    });

    // Reset form
    setSelectedFood(null);
    setAmount(150);
    setSearchTerm('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedFood(null);
    setAmount(150);
    setSearchTerm('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-blue-50 to-white">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-center text-xl font-semibold">
              添加记录
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            {/* 食物选择 */}
            <div className="space-y-2">
              <Label htmlFor="food-search">选择食物</Label>
              <Select value={selectedFood?.id} onValueChange={handleFoodSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择食物" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="搜索食物..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredFoods.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      {food.name}
                    </SelectItem>
                  ))}
                  {filteredFoods.length === 0 && (
                    <div className="text-center text-gray-500 py-2">
                      未找到相关食物
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 已选择的食物信息 */}
            {selectedFood && (
              <>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {selectedFood.name}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculateCalories()} kcal
                    </span>
                  </div>

                  {/* 数量调节 */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">数量</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleAmountChange(-10)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold w-16 text-center">
                          {amount}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {selectedFood.unit}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleAmountChange(10)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 餐次选择 */}
                <div className="space-y-2">
                  <Label htmlFor="meal-type">餐次</Label>
                  <Select value={mealType} onValueChange={setMealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">早餐</SelectItem>
                      <SelectItem value="lunch">午餐</SelectItem>
                      <SelectItem value="dinner">晚餐</SelectItem>
                      <SelectItem value="snack">加餐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 日期显示 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">日期</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </>
            )}

            {/* 分隔线 */}
            {selectedFood && (
              <div className="border-t border-gray-200 my-4"></div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAdd}
                disabled={!selectedFood}
              >
                添加至我的
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}