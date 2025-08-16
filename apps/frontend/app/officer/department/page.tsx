"use client";

import { useOfficerPortalStore } from "@/lib/officer-portal-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, Users, Calendar } from "lucide-react";

export default function OfficerDepartment() {
  const { officerProfile, department, stats } = useOfficerPortalStore();

  if (!department) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Department Information
          </h2>
          <p className="text-gray-600">
            No department is currently associated with your officer account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Department Information
          </h1>
          <p className="text-gray-600">Details about your department</p>
        </div>
      </div>

      {/* Department Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{department.name}</CardTitle>
          <CardDescription>{department.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Contact Info
                </p>
                <p className="text-sm">{department.contact_info}</p>
              </div>
            </div>
          </div>

          {/* Officer Information */}
          {officerProfile && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Your Role</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Position
                    </p>
                    <p className="text-sm">{officerProfile.position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{officerProfile.user?.role}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Department Statistics */}
          {stats && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Department Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.total}
                  </p>
                  <p className="text-xs text-blue-600">Appointments</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">
                      Pending
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {stats.pending}
                  </p>
                  <p className="text-xs text-yellow-600">To Review</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.confirmed}
                  </p>
                  <p className="text-xs text-green-600">Active</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Completed
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.completed}
                  </p>
                  <p className="text-xs text-blue-600">Finished</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
