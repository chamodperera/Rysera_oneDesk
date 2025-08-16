"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import { CreateOfficerDialog } from "@/components/admin/CreateOfficerDialog";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { User, Officer } from "@/lib/api";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const {
    users,
    usersPagination,
    usersLoading,
    officers,
    officersPagination,
    officersLoading,
    departments,
    loading,
    error,
    fetchUsers,
    fetchOfficers,
    fetchDepartments,
    deleteUser,
    deleteOfficer,
    clearError,
  } = useAdminStore();

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"users" | "officers">("users");

  // Dialog states
  const [showCreateOfficer, setShowCreateOfficer] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "user" | "officer";
    item: User | Officer | null;
  }>({ open: false, type: "user", item: null });

  // Initial data fetch
  useEffect(() => {
    fetchDepartments();
    if (activeTab === "users") {
      fetchUsers({
        page: currentPage,
        limit: 10,
        role: roleFilter !== "all" ? roleFilter : undefined,
        search: searchQuery || undefined,
      });
    } else {
      fetchOfficers({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
      });
    }
  }, [
    activeTab,
    currentPage,
    roleFilter,
    searchQuery,
    fetchUsers,
    fetchOfficers,
    fetchDepartments,
  ]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle role filter
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.item) return;

    let success = false;
    if (deleteDialog.type === "user") {
      success = await deleteUser(deleteDialog.item.id);
    } else {
      success = await deleteOfficer(deleteDialog.item.id);
    }

    if (success) {
      toast({
        title: "Success",
        description: `${deleteDialog.type === "user" ? "User" : "Officer"} deleted successfully`,
      });
    }

    setDeleteDialog({ open: false, type: "user", item: null });
  };

  // Format role badge
  const formatRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-red-100 text-red-800",
      officer: "bg-blue-100 text-blue-800",
      citizen: "bg-green-100 text-green-800",
    };
    return (
      variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  // Check if current user can be deleted (prevent self-deletion)
  const canDeleteUser = (user: User) => {
    return currentUser?.id !== user.id;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and officers in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateUser(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
          <Button
            onClick={() => setShowCreateOfficer(true)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <UserPlus className="h-4 w-4" />
            Create Officer
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          All Users
        </button>
        <button
          onClick={() => setActiveTab("officers")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "officers"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Officers
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-2"
              >
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {activeTab === "users" && (
              <div className="min-w-[180px]">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-2"
                >
                  Role
                </label>
                <Select value={roleFilter} onValueChange={handleRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="citizen">Citizens</SelectItem>
                    <SelectItem value="officer">Officers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === "users") {
                  fetchUsers();
                } else {
                  fetchOfficers();
                }
              }}
              disabled={usersLoading || officersLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${usersLoading || officersLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "users" ? "Users" : "Officers"}
            {(activeTab === "users" ? usersPagination : officersPagination) && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (
                {activeTab === "users"
                  ? usersPagination?.total_items
                  : officersPagination?.total_items}{" "}
                total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading || officersLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    {activeTab === "users" ? (
                      <TableHead>Role</TableHead>
                    ) : (
                      <>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                      </>
                    )}
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === "users"
                    ? users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            <Badge className={formatRoleBadge(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement edit user
                                  toast({
                                    title: "Feature Coming Soon",
                                    description:
                                      "User editing will be available soon",
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "user",
                                    item: user,
                                  })
                                }
                                disabled={!canDeleteUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : officers.map((officer) => (
                        <TableRow key={officer.id}>
                          <TableCell className="font-medium">
                            {officer.user?.first_name} {officer.user?.last_name}
                          </TableCell>
                          <TableCell>{officer.user?.email}</TableCell>
                          <TableCell>{officer.user?.phone_number}</TableCell>
                          <TableCell>
                            {officer.department?.name || "N/A"}
                          </TableCell>
                          <TableCell>{officer.position || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(officer.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement edit officer
                                  toast({
                                    title: "Feature Coming Soon",
                                    description:
                                      "Officer editing will be available soon",
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    type: "officer",
                                    item: officer,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {(activeTab === "users"
                ? usersPagination
                : officersPagination) && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(
                      currentPage * 10,
                      (activeTab === "users"
                        ? usersPagination?.total_items
                        : officersPagination?.total_items) || 0
                    )}{" "}
                    of{" "}
                    {activeTab === "users"
                      ? usersPagination?.total_items
                      : officersPagination?.total_items}{" "}
                    entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        currentPage >=
                        ((activeTab === "users"
                          ? usersPagination?.total_pages
                          : officersPagination?.total_pages) || 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Officer Dialog */}
      <CreateOfficerDialog
        open={showCreateOfficer}
        onOpenChange={setShowCreateOfficer}
        departments={departments}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, type: "user", item: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type}? This
              action cannot be undone.
              {deleteDialog.type === "user" &&
                deleteDialog.item &&
                "first_name" in deleteDialog.item && (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <strong>
                      {deleteDialog.item.first_name}{" "}
                      {deleteDialog.item.last_name}
                    </strong>{" "}
                    ({deleteDialog.item.email})
                  </div>
                )}
              {deleteDialog.type === "officer" &&
                deleteDialog.item &&
                "user" in deleteDialog.item && (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <strong>
                      {deleteDialog.item.user?.first_name}{" "}
                      {deleteDialog.item.user?.last_name}
                    </strong>{" "}
                    ({deleteDialog.item.user?.email})
                  </div>
                )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ open: false, type: "user", item: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
