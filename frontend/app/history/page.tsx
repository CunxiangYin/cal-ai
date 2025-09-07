'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/lib/store';
import { FoodRecordList } from '@/components/profile/FoodRecordList';
import { NutritionProgress } from '@/components/profile/NutritionProgress';

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { foodRecords, dailyCalorieGoal, deleteFoodRecord } = useStore();

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // Format date for comparison
  const getDateKey = (date: Date) => {
    return date.toLocaleDateString('zh-CN');
  };

  // Navigate between dates
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get records for selected date
  const selectedDateKey = getDateKey(selectedDate);
  const dateRecords = foodRecords.filter(r => r.date === selectedDateKey);

  // Calculate stats for the selected date
  const dateStats = useMemo(() => {
    const totalCalories = dateRecords.reduce((sum, r) => sum + r.calories, 0);
    const totalProtein = dateRecords.reduce((sum, r) => sum + (r.protein || 0), 0);
    const totalCarbs = dateRecords.reduce((sum, r) => sum + (r.carbs || 0), 0);
    const totalFat = dateRecords.reduce((sum, r) => sum + (r.fat || 0), 0);

    return {
      totalCalories,
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      caloriesDiff: totalCalories - dailyCalorieGoal,
    };
  }, [dateRecords, dailyCalorieGoal]);

  // Get weekly summary
  const weeklyStats = useMemo(() => {
    const weekDates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDates.push(getDateKey(date));
    }

    const weekRecords = foodRecords.filter(r => weekDates.includes(r.date));
    const daysWithRecords = new Set(weekRecords.map(r => r.date)).size;
    const totalWeekCalories = weekRecords.reduce((sum, r) => sum + r.calories, 0);
    const avgDailyCalories = daysWithRecords > 0 ? Math.round(totalWeekCalories / daysWithRecords) : 0;

    return {
      daysRecorded: daysWithRecords,
      avgDailyCalories,
      weekDates,
    };
  }, [selectedDate, foodRecords]);

  const nutrients = [
    {
      name: '碳水化合物',
      consumed: dateStats.totalCarbs,
      total: 250,
      unit: 'g',
      color: 'bg-blue-500',
    },
    {
      name: '蛋白质',
      consumed: dateStats.totalProtein,
      total: 60,
      unit: 'g',
      color: 'bg-green-500',
    },
    {
      name: '脂肪',
      consumed: dateStats.totalFat,
      total: 65,
      unit: 'g',
      color: 'bg-yellow-500',
    },
  ];

  const isToday = getDateKey(selectedDate) === getDateKey(new Date());

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Date Navigation */}
      <Card className="m-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center flex-1">
            <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
            {isToday && (
              <span className="text-xs text-blue-600 font-medium">今天</span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            className="h-8 w-8"
            disabled={isToday}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            回到今天
          </Button>
        )}
      </Card>

      {/* Daily Summary */}
      <Card className="mx-4 mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">每日摄入</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {dateStats.totalCalories}
            </p>
            <p className="text-xs text-gray-500">总卡路里</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              {dateStats.caloriesDiff > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <p className={`text-lg font-semibold ${
                dateStats.caloriesDiff > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {Math.abs(dateStats.caloriesDiff)}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {dateStats.caloriesDiff > 0 ? '超出目标' : '低于目标'}
            </p>
          </div>
        </div>
      </Card>

      {/* Nutrition Progress */}
      <Card className="mx-4 mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">营养成分</h3>
        <NutritionProgress nutrients={nutrients} />
      </Card>

      {/* Food Records */}
      <Card className="mx-4 mb-4 p-4">
        <FoodRecordList 
          records={dateRecords}
          date={selectedDateKey}
          onDelete={(id) => {
            if (confirm('确定要删除这条记录吗？')) {
              deleteFoodRecord(id);
            }
          }}
        />
      </Card>

      {/* Weekly Summary */}
      <Card className="mx-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">本周统计</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-900">
              {weeklyStats.daysRecorded}/7
            </p>
            <p className="text-xs text-blue-700">记录天数</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-900">
              {weeklyStats.avgDailyCalories}
            </p>
            <p className="text-xs text-green-700">平均每日卡路里</p>
          </div>
        </div>
      </Card>
    </div>
  );
}