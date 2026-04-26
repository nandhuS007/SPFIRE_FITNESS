import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Activity } from '../types';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

interface WeeklyChartProps {
  activities: Activity[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ activities }) => {
  const start = startOfWeek(new Date());
  const end = endOfWeek(new Date());
  const days = eachDayOfInterval({ start, end });

  const data = days.map(day => {
    const dayActivities = activities.filter(a => isSameDay(new Date(a.createdAt), day));
    const totalDistance = dayActivities.reduce((acc, curr) => acc + curr.distance, 0);
    return {
      day: format(day, 'EEE'),
      distance: totalDistance,
      fullDate: format(day, 'MMM d')
    };
  });

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: '#18181b', radius: 4 }}
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#FC4C02' }}
          />
          <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.distance > 0 ? '#FC4C02' : '#27272a'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
