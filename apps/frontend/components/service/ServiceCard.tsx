"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, FileText } from "lucide-react";
import { Service } from "@/lib/booking-types";
import { departments } from "@/lib/demo-data";
import { humanServiceDuration } from "@/lib/demo-utils";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const department = departments.find(
    (dept) => dept.id === service.departmentId
  );

  return (
    <Card className="border-blue-200/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {department?.name}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            {humanServiceDuration(service.durationMinutes)}
          </div>
        </div>
        <CardTitle className="text-xl">{service.name}</CardTitle>
        {service.description && (
          <CardDescription>{service.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Required Documents */}
        <div>
          <div className="flex items-center mb-2">
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Required Documents
            </span>
          </div>
          <div className="space-y-1">
            {service.requiredDocuments.map((doc, index) => (
              <div
                key={index}
                className="text-sm text-gray-600 flex items-center"
              >
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {doc}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
