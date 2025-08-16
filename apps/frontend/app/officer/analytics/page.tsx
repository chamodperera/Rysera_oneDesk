"use client";

import { useEffect, useState } from "react";
import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";

// Dummy analytics data
const generateDummyData = () => {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split("T")[0],
      appointments: Math.floor(Math.random() * 20) + 5,
      completed: Math.floor(Math.random() * 15) + 3,
      cancelled: Math.floor(Math.random() * 5) + 1,
    };
  }).reverse();

  const serviceTypes = [
    { name: "License Renewal", count: 145, percentage: 35 },
    { name: "ID Card Application", count: 89, percentage: 22 },
    { name: "Permit Registration", count: 76, percentage: 18 },
    { name: "Document Verification", count: 52, percentage: 13 },
    { name: "Consultation", count: 48, percentage: 12 },
  ];

  const timeSlots = [
    { time: "8:00-9:00", appointments: 12, utilization: 85 },
    { time: "9:00-10:00", appointments: 15, utilization: 95 },
    { time: "10:00-11:00", appointments: 18, utilization: 100 },
    { time: "11:00-12:00", appointments: 14, utilization: 87 },
    { time: "13:00-14:00", appointments: 16, utilization: 94 },
    { time: "14:00-15:00", appointments: 13, utilization: 81 },
    { time: "15:00-16:00", appointments: 11, utilization: 73 },
    { time: "16:00-17:00", appointments: 8, utilization: 57 },
  ];

  const citizenSatisfaction = {
    excellent: 156,
    good: 89,
    average: 23,
    poor: 8,
    terrible: 3,
  };

  const weeklyComparison = {
    thisWeek: { total: 127, completed: 98, pending: 23, cancelled: 6 },
    lastWeek: { total: 134, completed: 102, pending: 19, cancelled: 13 },
  };

  return {
    dailyData: last30Days,
    serviceTypes,
    timeSlots,
    citizenSatisfaction,
    weeklyComparison,
    totalAppointments: 410,
    avgCompletionTime: 24.5,
    satisfactionScore: 4.2,
    efficiencyRate: 87.3,
  };
};

export default function OfficerAnalytics() {
  const { officerProfile, department } = useOfficerPortalStore();
  const [dateRange, setDateRange] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState(generateDummyData());
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(generateDummyData());
      setIsLoading(false);
    }, 1000);
  };

  const exportData = () => {
    // Simulate export functionality
    const data = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${department?.name || "department"}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

  const weeklyChange = calculateChange(
    analyticsData.weeklyComparison.thisWeek.total,
    analyticsData.weeklyComparison.lastWeek.total
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Performance insights for {department?.name || "your department"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalAppointments}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {weeklyChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span
                className={
                  weeklyChange.isPositive ? "text-green-600" : "text-red-600"
                }
              >
                {weeklyChange.value}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.avgCompletionTime}min
            </div>
            <p className="text-xs text-muted-foreground">
              Per appointment processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfaction Score
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.satisfactionScore}/5.0
            </div>
            <p className="text-xs text-muted-foreground">
              Citizen feedback rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Efficiency Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.efficiencyRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Appointments completed on time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Service Distribution
            </CardTitle>
            <CardDescription>
              Most requested services in your department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.serviceTypes.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(index * 72) % 360}, 65%, 55%)`,
                      }}
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {service.count}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {service.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Time Slot Utilization
            </CardTitle>
            <CardDescription>
              Appointment distribution throughout the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.timeSlots.map((slot, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{slot.time}</span>
                    <span className="text-gray-600">
                      {slot.appointments} appointments ({slot.utilization}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${slot.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Performance
            </CardTitle>
            <CardDescription>Comparison with previous week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analyticsData.weeklyComparison.thisWeek.total}
                  </p>
                  <p className="text-xs text-gray-500">Total appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Last Week</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {analyticsData.weeklyComparison.lastWeek.total}
                  </p>
                  <p className="text-xs text-gray-500">Total appointments</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {analyticsData.weeklyComparison.thisWeek.completed}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-600">
                      {analyticsData.weeklyComparison.thisWeek.pending}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                      {analyticsData.weeklyComparison.thisWeek.cancelled}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citizen Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Citizen Satisfaction
            </CardTitle>
            <CardDescription>Feedback ratings from citizens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.citizenSatisfaction).map(
                ([rating, count], index) => {
                  const total = Object.values(
                    analyticsData.citizenSatisfaction
                  ).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);

                  const colors = {
                    excellent: "bg-green-500",
                    good: "bg-blue-500",
                    average: "bg-yellow-500",
                    poor: "bg-orange-500",
                    terrible: "bg-red-500",
                  };

                  return (
                    <div key={rating} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{rating}</span>
                        <span className="text-gray-600">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${colors[rating as keyof typeof colors]} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            30-Day Appointment Trends
          </CardTitle>
          <CardDescription>
            Daily appointment volume over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1 px-4">
            {analyticsData.dailyData.slice(-15).map((day, index) => {
              const maxAppointments = Math.max(
                ...analyticsData.dailyData.map((d) => d.appointments)
              );
              const height = (day.appointments / maxAppointments) * 200;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-w-[20px]"
                      style={{ height: `${height}px` }}
                      title={`${day.appointments} appointments on ${day.date}`}
                    />
                    <div
                      className="bg-green-500 rounded-b transition-all duration-300 hover:bg-green-600 min-w-[20px]"
                      style={{
                        height: `${(day.completed / maxAppointments) * 200}px`,
                      }}
                      title={`${day.completed} completed on ${day.date}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 rotate-45 origin-left">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm text-gray-600">Total Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
