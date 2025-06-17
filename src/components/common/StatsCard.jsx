// src/components/common/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, loading = false }) => {
  const isPositiveTrend = trend && trend > 0;
  const isNegativeTrend = trend && trend < 0;

  if (loading) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="mt-4 h-4 bg-gray-200 rounded w-24"></div>
        </div>
    );
  }

  return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          {Icon && (
              <div className="bg-green-100 p-3 rounded-lg">
                <Icon className="w-6 h-6 text-green-600" />
              </div>
          )}
        </div>

        {trend !== undefined && trend !== null && (
            <div className="mt-4 flex items-center">
              {isPositiveTrend && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+{trend}%</span>
                  </>
              )}
              {isNegativeTrend && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    <span className="text-sm text-red-600 font-medium">{trend}%</span>
                  </>
              )}
              {!isPositiveTrend && !isNegativeTrend && (
                  <span className="text-sm text-gray-600 font-medium">No change</span>
              )}
              <span className="text-xs text-gray-500 ml-2">from last month</span>
            </div>
        )}
      </div>
  );
};

export default StatsCard;