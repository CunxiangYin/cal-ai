'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CircularProgress } from '@/components/profile/CircularProgress';
import { NutritionProgress } from '@/components/profile/NutritionProgress';
import { FoodRecordList } from '@/components/profile/FoodRecordList';
import { useStore } from '@/lib/store';
import { Plus, BarChart3, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddFoodDialog } from '@/components/food/AddFoodDialog';

export default function ProfilePage() {
  const router = useRouter();
  const [showAddFood, setShowAddFood] = useState(false);
  const { 
    dailyCalorieGoal,
    getFoodRecordsByDate,
    getTotalCaloriesByDate,
    addFoodRecord,
    deleteFoodRecord
  } = useStore();

  const today = new Date().toLocaleDateString('zh-CN');
  const todayRecords = getFoodRecordsByDate(today);
  const todayCalories = getTotalCaloriesByDate(today);
  const remainingCalories = Math.max(0, dailyCalorieGoal - todayCalories);

  // Calculate nutrition totals
  const nutritionTotals = todayRecords.reduce(
    (acc, record) => {
      acc.protein += record.protein || 0;
      acc.carbs += record.carbs || 0;
      acc.fat += record.fat || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  const nutrients = [
    {
      name: '碳水',
      consumed: Math.round(nutritionTotals.carbs),
      total: 250, // Daily recommended
      unit: 'g',
      color: 'bg-blue-500',
    },
    {
      name: '蛋白质',
      consumed: Math.round(nutritionTotals.protein),
      total: 60, // Daily recommended
      unit: 'g',
      color: 'bg-green-500',
    },
    {
      name: '脂肪',
      consumed: Math.round(nutritionTotals.fat),
      total: 65, // Daily recommended
      unit: 'g',
      color: 'bg-yellow-500',
    },
  ];

  // Add some demo records if empty
  useEffect(() => {
    if (todayRecords.length === 0) {
      // Add demo data
      const demoRecords = [
        {
          id: '1',
          name: '米饭',
          amount: 150,
          unit: 'g',
          calories: 174,
          mealType: 'dinner',
          date: today,
          timestamp: new Date().toISOString(),
          protein: 3.9,
          carbs: 38.85,
          fat: 0.45,
          healthStatus: 'good' as const,
          icon: '🍚',
        },
        {
          id: '2',
          name: '番茄牛肉',
          amount: 200,
          unit: 'g',
          calories: 259,
          mealType: 'dinner',
          date: today,
          timestamp: new Date().toISOString(),
          protein: 30,
          carbs: 10,
          fat: 16,
          healthStatus: 'good' as const,
          icon: '🥩',
        },
        {
          id: '3',
          name: '清炒白菜',
          amount: 200,
          unit: 'g',
          calories: 124,
          mealType: 'dinner',
          date: today,
          timestamp: new Date().toISOString(),
          protein: 3,
          carbs: 6.4,
          fat: 0.4,
          healthStatus: 'good' as const,
          icon: '🥬',
        },
      ];
      
      demoRecords.forEach(record => addFoodRecord(record));
    }
  }, [addFoodRecord, today, todayRecords.length]);

  const handleAddFood = (food: { name: string; amount: number; unit: string; calories: number; mealType: string; date: string; protein?: number; carbs?: number; fat?: number }) => {
    addFoodRecord({
      id: Date.now().toString(),
      ...food,
      timestamp: new Date().toISOString(),
      healthStatus: 'good' as const,
      icon: '🍽️',
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Calorie Progress Circle */}
      <Card className="m-4 p-6 flex justify-center">
        <CircularProgress
          consumed={todayCalories}
          total={dailyCalorieGoal}
          remaining={remainingCalories}
        />
      </Card>

      {/* Nutrition Progress */}
      <Card className="mx-4 mb-4 p-4">
        <NutritionProgress nutrients={nutrients} />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-4">
        <Button
          variant="outline"
          onClick={() => router.push('/history')}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <History className="h-5 w-5 text-gray-600" />
          <span className="text-xs">历史记录</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/stats')}
          className="flex flex-col items-center gap-2 h-auto py-3"
        >
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <span className="text-xs">数据统计</span>
        </Button>
      </div>

      {/* Food Records */}
      <Card className="mx-4 p-4">
        <FoodRecordList 
          records={todayRecords}
          date={today}
          onDelete={(id) => {
            if (confirm('确定要删除这条记录吗？')) {
              deleteFoodRecord(id);
            }
          }}
        />
      </Card>

      {/* Floating Add Button */}
      <Button
        onClick={() => setShowAddFood(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-10"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Food Dialog */}
      <AddFoodDialog
        open={showAddFood}
        onOpenChange={setShowAddFood}
        onAddFood={handleAddFood}
      />
    </div>
  );
}