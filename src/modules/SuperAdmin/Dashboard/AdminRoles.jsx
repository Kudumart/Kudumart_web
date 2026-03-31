//@ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useModal } from "../../../hooks/modal";
import ConfirmModal from "../../../components/ConfirmModal";
import apiClient from "../../../api/apiFactory";
import QueryCage from "../../../components/query/QueryCage";
import DialogModal from "../../../components/modals/DialogModal";
import SimpleModal from "../../../components/dialogs-modals/SimpleModal";

const AdminRoles = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModal();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  // Modal refs
  const editModalRef = useRef(null);
  const permissionModalRef = useRef(null);
  const assignModalRef = useRef(null);
  const viewPermissionsModalRef = useRef(null);

  // Forms
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm({ defaultValues: { name: "" } });

  const {
    register: registerPermission,
    handleSubmit: handlePermissionSubmit,
    reset: resetPermission,
  } = useForm({ defaultValues: { name: "" } });

  const {
    register: registerAssign,
    handleSubmit: handleAssignSubmit,
    reset: resetAssign,
    setValue: setAssignValue,
  } = useForm({ defaultValues: { roleId: "" } });

  // Queries
  const rolesQuery = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/roles");
      return res.data;
    },
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const res = await apiClient.get("/admin/permissions");
      return res.data;
    },
  });

  const rolePermissionsQuery = useQuery({
    queryKey: ["admin-role-permissions", selectedRole?.id],
    queryFn: async () => {
      const res = await apiClient.get(
        `/admin/role/view/permissions?roleId=${selectedRole.id}`,
      );
      return res.data;
    },
    enabled: !!selectedRole?.id,
  });

  const roles = rolesQuery.data?.data || [];
  const permissions = permissionsQuery.data?.data || [];

  const extractRolePermissions = (data) => {
    if (data?.data?.permissions) return data.data.permissions;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.permissions)) return data.permissions;
    return [];
  };
  const rolePermissions = extractRolePermissions(rolePermissionsQuery.data);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: async ({ name }) => {
      const res = await apiClient.put("/admin/role/update", {
        roleId: selectedRole.id,
        name,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      editModalRef.current?.close();
      setSelectedRole(null);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId) => {
      const res = await apiClient.delete(
        `/admin/role/delete/permission?roleId=${roleId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: async ({ name }) => {
      const res = await apiClient.post("/admin/permission/create", { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      permissionModalRef.current?.close();
      resetPermission();
    },
  });

  const assignPermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }) => {
      const res = await apiClient.post("/admin/role/assign/permission", {
        roleId,
        permissionId,
      });
      return res.data;
    },
  });

  const removePermissionFromRoleMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }) => {
      const res = await apiClient.delete(
        `/admin/role/delete/permission?roleId=${roleId}&permissionId=${permissionId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-role-permissions", selectedRole?.id],
      });
    },
  });

  const handleEditRole = (role) => {
    setSelectedRole(role);
    resetEdit({ name: role.name || "" });
    editModalRef.current?.open();
    setActiveDropdown(null);
  };

  const handleDeleteRole = (roleId) => {
    openModal({
      size: "sm",
      content: (
        <ConfirmModal
          title="Delete Role"
          message="Are you sure you want to delete this role? This action cannot be undone."
          onConfirm={() => deleteRoleMutation.mutate(roleId)}
          confirmText="Delete"
          confirmColor="red"
        />
      ),
    });
    setActiveDropdown(null);
  };

  const handleRemovePermissionFromRole = (roleId, permissionId) => {
    openModal({
      size: "sm",
      content: (
        <ConfirmModal
          title="Remove Permission"
          message="Are you sure you want to remove this permission from the role? This action cannot be undone."
          onConfirm={() =>
            removePermissionFromRoleMutation.mutate({ roleId, permissionId })
          }
          confirmText="Remove"
          confirmColor="red"
        />
      ),
    });
  };

  const openCreatePermissionModal = () => {
    resetPermission({ name: "" });
    permissionModalRef.current?.open();
  };

  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    viewPermissionsModalRef.current?.open();
    setActiveDropdown(null);
  };

  const toggleDropdown = (roleId) => {
    setActiveDropdown(activeDropdown === roleId ? null : roleId);
  };

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const togglePermissionId = (id) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleAssignSubmitFn = async ({ roleId }) => {
    if (!roleId || selectedPermissionIds.length === 0) return;
    await Promise.all(
      selectedPermissionIds.map((permissionId) =>
        assignPermissionMutation.mutateAsync({ roleId, permissionId }),
      ),
    );
    queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    assignModalRef.current?.close();
    resetAssign();
    setSelectedPermissionIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-1">Manage roles and permissions</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 overflow-hidden">
            <div className="flex gap-3 flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 flex-1 min-w-0"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  resetAssign({ roleId: "" });
                  setSelectedPermissionIds([]);
                  assignModalRef.current?.open();
                }}
                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Assign Permission
              </button>
              <Link
                to="/admin/sub-admins/create-role"
                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Role
              </Link>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        <QueryCage query={rolesQuery}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">
                      Admin Role Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[150px]">
                      Date Added
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-8 text-gray-500"
                      >
                        {searchTerm
                          ? `No roles found matching "${searchTerm}"`
                          : "No roles found"}
                        <div className="mt-2">
                          <Link
                            to="/admin/sub-admins/create-role"
                            className="text-orange-600 hover:text-orange-700 underline"
                          >
                            Create your first role
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role, index) => (
                      <tr key={role.id || index} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-gray-900">{role.name}</td>
                        <td className="py-4 px-6 text-gray-600">
                          {formatDate(role.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(role.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {activeDropdown === role.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <button
                                  onClick={() => handleViewPermissions(role)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  View Permissions
                                </button>
                                <button
                                  onClick={() => handleEditRole(role)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit Role
                                </button>
                                <button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                >
                                  <svg
                                    className="w-4 h-4 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete Role
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">Items per page:</span>
                <select className="ml-2 border border-gray-300 rounded-sm px-2 py-1 text-sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </QueryCage>

        {/* Permissions Table — view only, no edit/delete */}
        <QueryCage query={permissionsQuery}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Permissions
                </h3>
                {/* <button
                  onClick={openCreatePermissionModal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + Add Permission
                </button>*/}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">
                      Permission Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[150px]">
                      Date Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {permissions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="2"
                        className="text-center py-8 text-gray-500"
                      >
                        No permissions found
                      </td>
                    </tr>
                  ) : (
                    permissions.map((permission, index) => (
                      <tr
                        key={permission.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-4 px-6 text-gray-900">
                          {permission.name}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {formatDate(permission.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </QueryCage>
      </div>

      {/* Edit Role Modal */}
      <DialogModal ref={editModalRef} title="Edit Role">
        <form
          onSubmit={handleEditSubmit((data) => updateRoleMutation.mutate(data))}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Name *
            </label>
            <input
              type="text"
              {...registerEdit("name", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              placeholder="Enter role name"
            />
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => editModalRef.current?.close()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateRoleMutation.isPending}
              className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {updateRoleMutation.isPending ? "Saving..." : "Update Role"}
            </button>
          </div>
        </form>
      </DialogModal>

      {/* Create Permission Modal */}
      <DialogModal ref={permissionModalRef} title="Create Permission">
        <form
          onSubmit={handlePermissionSubmit((data) =>
            createPermissionMutation.mutate(data),
          )}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Name *
            </label>
            <input
              type="text"
              {...registerPermission("name", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
              placeholder="Enter permission name (e.g., delete-role-permissions)"
            />
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => permissionModalRef.current?.close()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPermissionMutation.isPending}
              className="px-6 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              {createPermissionMutation.isPending
                ? "Saving..."
                : "Create Permission"}
            </button>
          </div>
        </form>
      </DialogModal>

      {/* Assign Permissions Modal */}
      <SimpleModal
        ref={assignModalRef}
        title="Assign Permissions to Role"
        actions={
          <button
            onClick={handleAssignSubmit(handleAssignSubmitFn)}
            disabled={
              assignPermissionMutation.isPending ||
              selectedPermissionIds.length === 0
            }
            className="px-6 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 font-medium"
          >
            {assignPermissionMutation.isPending
              ? "Assigning..."
              : `Assign${selectedPermissionIds.length > 0 ? ` (${selectedPermissionIds.length})` : ""}`}
          </button>
        }
      >
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role *
            </label>
            <select
              {...registerAssign("roleId", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Permissions *
              {selectedPermissionIds.length > 0 && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  {selectedPermissionIds.length} selected
                </span>
              )}
            </label>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {permissions.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">
                  No permissions available
                </p>
              ) : (
                permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-green-600 rounded"
                      checked={selectedPermissionIds.includes(permission.id)}
                      onChange={() => togglePermissionId(permission.id)}
                    />
                    <span className="text-sm text-gray-800">
                      {permission.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </SimpleModal>

      {/* View Permissions Modal */}
      <div data-theme="kudu">
        <SimpleModal
          ref={viewPermissionsModalRef}
          title={`Permissions for "${selectedRole?.name}"`}
          actions={
            Array.isArray(rolePermissions) &&
            rolePermissions.length > 0 && (
              <button
                onClick={() => {
                  viewPermissionsModalRef.current?.close();
                  setAssignValue("roleId", selectedRole?.id);
                  setSelectedPermissionIds([]);
                  assignModalRef.current?.open();
                }}
                className="inline-flex items-center px-5 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Assign More
              </button>
            )
          }
        >
          {rolePermissionsQuery.isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : !Array.isArray(rolePermissions) ||
            rolePermissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-medium mb-2">
                {rolePermissionsQuery.isError
                  ? "Access Denied"
                  : "No permissions assigned"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {rolePermissionsQuery.isError
                  ? "You don't have permission to view role permissions. Contact your administrator."
                  : "This role has no permissions yet"}
              </p>
              {!rolePermissionsQuery.isError && (
                <button
                  onClick={() => {
                    viewPermissionsModalRef.current?.close();
                    setAssignValue("roleId", selectedRole?.id);
                    setSelectedPermissionIds([]);
                    assignModalRef.current?.open();
                  }}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Assign permissions to this role
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {rolePermissions.length} permission
                {rolePermissions.length !== 1 ? "s" : ""} assigned
              </p>
              <div className="grid gap-3">
                {rolePermissions.map((permission, index) => {
                  const permissionName =
                    permission?.name ||
                    permission?.permission?.name ||
                    `Permission ${index + 1}`;
                  const permissionId =
                    permission?.id || permission?.permission?.id || index;
                  return (
                    <div
                      key={permissionId}
                      className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="shrink-0 mt-0.5">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 break-words">
                              {permissionName}
                            </h4>
                            {permission?.createdAt && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Added: {formatDate(permission.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                          <button
                            onClick={() =>
                              handleRemovePermissionFromRole(
                                selectedRole?.id,
                                permissionId,
                              )
                            }
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                            title="Remove permission from role"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SimpleModal>
      </div>
    </div>
  );
};

export default AdminRoles;
