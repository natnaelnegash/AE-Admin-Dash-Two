import { BarChart as BarChartIcon, DollarSign, Users, ShoppingBag, Loader2, AlertCircle, TrendingUp, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { StatCard } from "../../components/ui";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from "recharts";

const PIE_COLORS = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6'];

export function AnalyticsDashboard() {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.analytics.overview,
    queryFn: async () => {
      const res = await api.get('/v1/analytics/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">
          Compiling Platform Analytics...
        </p>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-foreground text-lg font-bold">Analytics Unavailable</h3>
        <p className="text-muted-foreground mt-2">Failed to load platform statistics from the server.</p>
      </div>
    );
  }

  const { kpis, charts, breakdowns, topPerformers } = response.data;

  // Format data for Recharts if necessary
  const revenueData = charts?.revenueOverTime || [];
  const orderStatusData = breakdowns?.ordersByStatus?.map((item: any) => ({
    name: item.status ? item.status.replace('_', ' ') : 'UNKNOWN',
    value: Number(item.count) || 0
  })) || [];

  return (
    <div className="space-y-8 relative h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground font-medium">Real-time performance metrics and historical trends</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Revenue"
          value={`ETB ${(kpis?.totalRevenue || 0).toLocaleString()}`}
          trend={kpis?.revenueGrowth}
          icon={DollarSign}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
        />
        <StatCard
          label="Total Orders"
          value={(kpis?.totalOrders || 0).toLocaleString()}
          trend={kpis?.ordersGrowth}
          icon={ShoppingBag}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
        />
        <StatCard
          label="Active Users"
          value={(kpis?.activeUsers || 0).toLocaleString()}
          icon={Users}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
        />
        <StatCard
          label="Active Fleet"
          value={(kpis?.activeFleet || 0).toString()}
          icon={BarChartIcon}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="lg:col-span-2 admin-card p-6 flex flex-col shadow-xl border border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" />
              Revenue Over Time
            </h3>
          </div>
          <div className="flex-1 w-full h-[300px]">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.2)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    dy={10}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    dx={-10}
                    tickFormatter={(val) => `ETB ${val >= 1000 ? (val/1000).toFixed(1)+'k' : val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(75, 85, 99, 0.4)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                    formatter={(value: number) => [`ETB ${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">Not enough historical data to generate chart.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="admin-card p-6 flex flex-col shadow-xl border border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-foreground mb-2 text-center">Order Status Breakdown</h3>
          <div className="flex-1 w-full h-[300px] flex items-center justify-center">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {orderStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(75, 85, 99, 0.4)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm font-medium">No order data available.</p>
            )}
          </div>
        </div>

      </div>

      {/* Top Performers Table */}
      {topPerformers?.restaurants && topPerformers.restaurants.length > 0 && (
        <div className="admin-card overflow-hidden shadow-xl border border-border bg-card/50 backdrop-blur-sm mt-6">
          <div className="p-6 border-b border-border/50 bg-secondary/20 flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 rounded-xl">
              <Store className="text-orange-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Top Performing Merchants</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Ranked by Total Volume</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Restaurant Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Orders</th>
                  <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topPerformers.restaurants.map((rest: any, idx: number) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                        idx === 1 ? 'bg-gray-400/20 text-gray-400' :
                        idx === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-secondary text-muted-foreground'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">{rest.name}</td>
                    <td className="px-6 py-4 font-black text-muted-foreground">{rest.ordersCount?.toLocaleString() || rest.orders?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-right font-black text-primary">
                      ETB {(rest.totalSales || rest.revenue || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
