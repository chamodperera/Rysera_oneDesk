"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { departments } from "@/lib/demo-data";

export interface FilterState {
  search: string;
  department: string;
}

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function FiltersBar({
  filters,
  onFiltersChange,
  onClearFilters,
}: FiltersBarProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || filters.department;

  return (
    <div className="space-y-4 p-4 bg-card border rounded-lg">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by booking reference or service name..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Department Filter */}
        <Select
          value={filters.department || "all"}
          onValueChange={(value) =>
            updateFilter("department", value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full md:w-[200px] focus-visible:ring-2 focus-visible:ring-primary">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
