import { BarChart3 } from 'lucide-react';

export default function RevenueTab() {
  return (
    <div className="space-y-6">
      {/* Placeholder Content */}
      <div className="glass-card p-12 border border-slate-700/50 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-slate-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Revenue Dashboard</h3>
        <p className="text-slate-400 max-w-md mx-auto">
          The revenue analytics section is coming soon. This will include sales charts, revenue trends, 
          payment breakdowns, and profitability metrics.
        </p>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border border-slate-700/50 rounded-lg">
          <h4 className="font-semibold text-white mb-3">📊 Coming Features</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Total Revenue Overview</li>
            <li>• Monthly Revenue Trends</li>
            <li>• Top Products by Sales</li>
            <li>• Revenue by Category</li>
          </ul>
        </div>
        <div className="glass-card p-6 border border-slate-700/50 rounded-lg">
          <h4 className="font-semibold text-white mb-3">💰 Additional Metrics</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Payment Method Breakdown</li>
            <li>• Top Selling Farmers</li>
            <li>• Customer Spending Patterns</li>
            <li>• Commission Analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
