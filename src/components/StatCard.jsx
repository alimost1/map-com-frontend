import { forwardRef } from 'react';

export const StatCard = forwardRef(function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = 'primary',
  className = '',
}, ref) {
  const colors = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', iconBg: 'bg-primary-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', iconBg: 'bg-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100' },
  };
  
  const c = colors[color] || colors.primary;
  
  return (
    <div
      ref={ref}
      className={`p-4 rounded-xl border ${c.bg} border-transparent hover:border-gray-200 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-dark-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-dark-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${c.iconBg}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';