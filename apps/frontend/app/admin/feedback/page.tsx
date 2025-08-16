"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/feedback/StarRating";
import {
  Download,
  MessageSquare,
  TrendingUp,
  Star,
  Search,
  Calendar,
} from "lucide-react";
import { useAppointments } from "@/lib/demo-store";
import { services } from "@/lib/demo-data";
import { formatDate, toCsv, downloadCsv } from "@/lib/demo-utils";
import { Service, Feedback, Rating } from "@/lib/booking-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminFeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");

  const { getAllFeedbacks, getServiceFeedback, getServiceRatingStats } =
    useAppointments();

  // Get all feedback
  const allFeedback = getAllFeedbacks();

  // Create services map for quick lookup
  const servicesMap = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((service) => map.set(service.id, service));
    return map;
  }, []);

  // Filter feedback based on search and filters
  const filteredFeedback = useMemo(() => {
    let filtered = allFeedback;

    // Filter by service
    if (selectedService !== "all") {
      filtered = filtered.filter(
        (f: Feedback) => f.serviceId === selectedService
      );
    }

    // Filter by rating
    if (selectedRating !== "all") {
      const rating = parseInt(selectedRating);
      filtered = filtered.filter((f: Feedback) => f.rating === rating);
    }

    // Filter by search term (in comments)
    if (searchTerm) {
      filtered = filtered.filter(
        (f: Feedback) =>
          f.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          servicesMap
            .get(f.serviceId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort(
      (a: Feedback, b: Feedback) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allFeedback, selectedService, selectedRating, searchTerm, servicesMap]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (allFeedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        commentsCount: 0,
      };
    }

    const distribution = allFeedback.reduce(
      (acc: Record<number, number>, feedback: Feedback) => {
        acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const averageRating =
      allFeedback.reduce((sum: number, f: Feedback) => sum + f.rating, 0) /
      allFeedback.length;
    const commentsCount = allFeedback.filter(
      (f: Feedback) => f.comment && f.comment.trim()
    ).length;

    return {
      totalFeedback: allFeedback.length,
      averageRating,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...distribution },
      commentsCount,
    };
  }, [allFeedback]);

  // Get service-specific stats
  const serviceStats = useMemo(() => {
    return services
      .map((service) => {
        const stats = getServiceRatingStats(service.id);
        const feedbackCount = getServiceFeedback(service.id).length;
        return {
          service,
          averageRating: stats.avg,
          count: stats.count,
          buckets: stats.buckets,
          totalFeedback: feedbackCount,
        };
      })
      .filter((s) => s.totalFeedback > 0)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [getServiceRatingStats, getServiceFeedback]);

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = toCsv(filteredFeedback, servicesMap);
    const filename = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCsv(csvContent, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Analytics</h1>
          <p className="text-muted-foreground">
            Monitor service quality and citizen satisfaction
          </p>
        </div>
        <Button
          onClick={handleExportCsv}
          className="bg-primary hover:bg-primary/90"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalFeedback}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallStats.commentsCount} with comments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <StarRating
                value={Math.round(overallStats.averageRating) as Rating}
                readonly
                size="sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfaction Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats.totalFeedback > 0
                ? Math.round(
                    ((overallStats.distribution[4] +
                      overallStats.distribution[5]) /
                      overallStats.totalFeedback) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">4+ star ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceStats.length}</div>
            <p className="text-xs text-muted-foreground">with feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>
            Breakdown of ratings across all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[60px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-in-out"
                      style={{
                        width: `${
                          overallStats.totalFeedback > 0
                            ? Math.min(
                                100,
                                Math.max(
                                  0,
                                  (overallStats.distribution[
                                    rating as keyof typeof overallStats.distribution
                                  ] /
                                    overallStats.totalFeedback) *
                                    100
                                )
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                  {
                    overallStats.distribution[
                      rating as keyof typeof overallStats.distribution
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Average ratings by service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceStats.map((stat) => (
              <div
                key={stat.service.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{stat.service.name}</h4>
                    <Badge variant="secondary">
                      {stat.service.departmentId}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.totalFeedback} feedback submissions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {stat.averageRating.toFixed(1)}
                  </div>
                  <StarRating
                    value={Math.round(stat.averageRating) as Rating}
                    readonly
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Details</CardTitle>
          <CardDescription>
            Review individual feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback or service name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {rating} Stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found matching your criteria.</p>
              </div>
            ) : (
              filteredFeedback.map((feedback: Feedback) => (
                <div
                  key={feedback.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">
                          {servicesMap.get(feedback.serviceId)?.name ||
                            "Unknown Service"}
                        </h4>
                        <Badge variant="secondary">
                          {servicesMap.get(feedback.serviceId)?.departmentId ||
                            "Unknown"}
                        </Badge>
                      </div>
                      <StarRating value={feedback.rating} readonly />
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatDate(feedback.createdAt)}</p>
                      <p className="text-xs">
                        ID: {feedback.appointmentId.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {feedback.comment && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{feedback.comment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
