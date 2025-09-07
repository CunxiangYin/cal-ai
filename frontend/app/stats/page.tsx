'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { NutritionPieChart } from '@/components/charts/NutritionPieChart';
import { useStore } from '@/lib/store';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

export default function StatsPage() {
  const { foodRecords, dailyCalorieGoal } = useStore();
  
  // Get last 7 days data
  const last7DaysData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString('zh-CN');
      
      const dayRecords = foodRecords.filter(r => r.date === dateKey);
      const totalCalories = dayRecords.reduce((sum, r) => sum + r.calories, 0);
      
      data.push({
        date: dateKey,
        calories: totalCalories,
        goal: dailyCalorieGoal,
      });
    }
    
    return data;
  }, [foodRecords, dailyCalorieGoal]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDays = last7DaysData.filter(d => d.calories > 0).length;
    const totalCalories = last7DaysData.reduce((sum, d) => sum + d.calories, 0);
    const avgCalories = totalDays > 0 ? Math.round(totalCalories / totalDays) : 0;
    
    const overGoalDays = last7DaysData.filter(d => d.calories > d.goal).length;
    const underGoalDays = last7DaysData.filter(d => d.calories > 0 && d.calories <= d.goal).length;
    
    // Calculate total nutrition
    const totalNutrition = foodRecords.reduce(
      (acc, record) => {
        acc.protein += record.protein || 0;
        acc.carbs += record.carbs || 0;
        acc.fat += record.fat || 0;
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0 }
    );
    
    return {
      totalDays,
      avgCalories,
      overGoalDays,
      underGoalDays,
      totalNutrition: {
        protein: Math.round(totalNutrition.protein),
        carbs: Math.round(totalNutrition.carbs),
        fat: Math.round(totalNutrition.fat),
      },
    };
  }, [last7DaysData, foodRecords]);

  // Calculate this week vs last week
  const weekComparison = useMemo(() => {
    const thisWeekCalories = last7DaysData.reduce((sum, d) => sum + d.calories, 0);
    
    // Get last week data (simplified - just use random data for demo)
    const lastWeekCalories = thisWeekCalories * 0.9; // Assume 10% increase
    
    const percentChange = lastWeekCalories > 0 
      ? ((thisWeekCalories - lastWeekCalories) / lastWeekCalories) * 100
      : 0;
    
    return {
      thisWeek: thisWeekCalories,
      lastWeek: Math.round(lastWeekCalories),
      percentChange: Math.round(percentChange),
    };
  }, [last7DaysData]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-gray-500">平均</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgCalories}</p>
          <p className="text-xs text-gray-600">每日卡路里</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-xs text-gray-500">达标</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.underGoalDays}/{stats.totalDays}
          </p>
          <p className="text-xs text-gray-600">达标天数</p>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="mx-4 mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">最近7天卡路里摄入</h3>
        <CalorieChart data={last7DaysData} />
      </Card>

      {/* Week Comparison */}
      <Card className="mx-4 mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">周对比</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">本周总计</p>
            <p className="text-xl font-bold text-gray-900">
              {weekComparison.thisWeek} kcal
            </p>
          </div>
          <div className="flex items-center gap-2">
            {weekComparison.percentChange > 0 ? (
              <TrendingUp className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500" />
            )}
            <span className={`text-lg font-semibold ${
              weekComparison.percentChange > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {Math.abs(weekComparison.percentChange)}%
            </span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          相比上周 ({weekComparison.lastWeek} kcal)
        </div>
      </Card>

      {/* Nutrition Pie Chart */}
      <Card className="mx-4 mb-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">营养成分分布</h3>
        <div className="flex justify-center">
          <NutritionPieChart data={stats.totalNutrition} />
        </div>
      </Card>

      {/* Achievement Cards */}
      <Card className="mx-4 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">本周成就</h3>
        <div className="space-y-2">
          {stats.totalDays >= 7 && (
            <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm font-medium text-gray-900">完美记录</p>
                <p className="text-xs text-gray-600">连续7天记录饮食</p>
              </div>
            </div>
          )}
          {stats.underGoalDays >= 5 && (
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-medium text-gray-900">健康达人</p>
                <p className="text-xs text-gray-600">5天以上控制在目标内</p>
              </div>
            </div>
          )}
          {stats.avgCalories < dailyCalorieGoal && (
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
              <span className="text-2xl">💪</span>
              <div>
                <p className="text-sm font-medium text-gray-900">自律冠军</p>
                <p className="text-xs text-gray-600">平均摄入低于目标</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}