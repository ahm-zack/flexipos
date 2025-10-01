"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  Star,
  Award,
  Activity,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 12400, orders: 234 },
  { month: "Feb", revenue: 15200, orders: 287 },
  { month: "Mar", revenue: 18900, orders: 342 },
  { month: "Apr", revenue: 16700, orders: 298 },
  { month: "May", revenue: 21300, orders: 389 },
  { month: "Jun", revenue: 24800, orders: 445 },
  { month: "Jul", revenue: 28200, orders: 512 },
  { month: "Aug", revenue: 26900, orders: 478 },
  { month: "Sep", revenue: 31400, orders: 567 },
  { month: "Oct", revenue: 34200, orders: 623 },
  { month: "Nov", revenue: 37800, orders: 689 },
  { month: "Dec", revenue: 42100, orders: 756 },
];

const topProductsData = [
  { name: "Margherita Pizza", sales: 1247, revenue: 18705 },
  { name: "Chicken Burger", sales: 987, revenue: 14805 },
  { name: "Apple Pie", sales: 654, revenue: 9810 },
  { name: "Caesar Salad", sales: 543, revenue: 8145 },
  { name: "Chocolate Shake", sales: 432, revenue: 6480 },
];

const categoryData = [
  { name: "Pizza", value: 35, color: "#8b5cf6" },
  { name: "Burgers", value: 25, color: "#06b6d4" },
  { name: "Desserts", value: 20, color: "#10b981" },
  { name: "Beverages", value: 12, color: "#f59e0b" },
  { name: "Others", value: 8, color: "#ef4444" },
];

const hourlyOrdersData = [
  { hour: "6AM", orders: 12 },
  { hour: "7AM", orders: 28 },
  { hour: "8AM", orders: 45 },
  { hour: "9AM", orders: 32 },
  { hour: "10AM", orders: 38 },
  { hour: "11AM", orders: 67 },
  { hour: "12PM", orders: 89 },
  { hour: "1PM", orders: 94 },
  { hour: "2PM", orders: 78 },
  { hour: "3PM", orders: 56 },
  { hour: "4PM", orders: 42 },
  { hour: "5PM", orders: 38 },
  { hour: "6PM", orders: 72 },
  { hour: "7PM", orders: 86 },
  { hour: "8PM", orders: 91 },
  { hour: "9PM", orders: 74 },
  { hour: "10PM", orders: 52 },
  { hour: "11PM", orders: 31 },
];

// Widget Component
function Widget({
  title,
  value,
  change,
  icon: Icon,
  trend,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down";
  subtitle?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
          )}
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="size-4 text-green-500" />
            ) : (
              <TrendingDown className="size-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
            </span>
            <span className="text-sm text-muted-foreground">vs last month</span>
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-xl">
          <Icon className="size-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

// Chart Card Component
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your business
            today.
          </p>
        </div>
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
          Live Data
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Widget
          title="Total Revenue"
          value="$42,100"
          change="+12.3%"
          icon={DollarSign}
          trend="up"
          subtitle="This month"
        />
        <Widget
          title="Total Orders"
          value="756"
          change="+8.7%"
          icon={ShoppingBag}
          trend="up"
          subtitle="This month"
        />
        <Widget
          title="Active Customers"
          value="1,247"
          change="+15.2%"
          icon={Users}
          trend="up"
          subtitle="This month"
        />
        <Widget
          title="Avg Order Value"
          value="$55.69"
          change="-2.1%"
          icon={Activity}
          trend="down"
          subtitle="This month"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard
          title="Revenue Overview"
          subtitle="Monthly revenue and order trends"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard
          title="Sales by Category"
          subtitle="Product category distribution"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <ChartCard
          title="Top Selling Products"
          subtitle="Best performing items this month"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="sales" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Hourly Orders */}
        <ChartCard title="Orders by Hour" subtitle="Today's order distribution">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyOrdersData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Star className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Customer Rating</h3>
              <p className="text-sm text-muted-foreground">
                Average this month
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">4.8</span>
            <span className="text-muted-foreground text-lg mb-1">/5.0</span>
          </div>
          <p className="text-sm text-green-600 mt-2">+0.3 from last month</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Clock className="size-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Avg Prep Time</h3>
              <p className="text-sm text-muted-foreground">This week</p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">12</span>
            <span className="text-muted-foreground text-lg mb-1">min</span>
          </div>
          <p className="text-sm text-green-600 mt-2">-2 min faster</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Award className="size-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Top Chef</h3>
              <p className="text-sm text-muted-foreground">
                Most orders completed
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-lg font-bold text-foreground">
              Mario Rodriguez
            </span>
          </div>
          <p className="text-sm text-orange-600 mt-2">342 orders this month</p>
        </div>
      </div>
    </div>
  );
}
