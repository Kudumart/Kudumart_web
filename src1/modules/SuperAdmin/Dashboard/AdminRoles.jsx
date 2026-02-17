import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useModal } from '../../../hooks/modal';
import ConfirmModal from '../../../components/ConfirmModal';

const AdminRoles = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showAssignPermissionModal, setShowAssignPermissionModal] = useState(false);
    const [showViewPermissionsModal, setShowViewPermissionsModal] = useState(false);
    const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editForm, setEditForm] = useState({ name: '' });
    const [permissionForm, setPermissionForm] = useState({ name: '' });
    const [assignForm, setAssignForm] = useState({ roleId: '', permissionId: '' });
    const { mutate } = useApiMutation();
    const { openModal } = useModal();

    useEffect(() => {
        console.log("🚀 [AdminRoles] Component mounted, initializing...");
        fetchRoles();
        fetchPermissions();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchRoles = () => {
        console.log("🔍 [AdminRoles] Fetching admin roles from /admin/roles...");
        setLoading(true);
        mutate({
            url: '/admin/roles',
            method: 'GET',
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully fetched admin roles:", response.data);
                setRoles(response.data.data || []);
                setLoading(false);
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error fetching admin roles:", error);
                setLoading(false);
            }
        });
    };

    const fetchPermissions = () => {
        console.log("🔍 [AdminRoles] Fetching permissions from /admin/permissions...");
        mutate({
            url: '/admin/permissions',
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully fetched permissions:", response.data);
                setPermissions(response.data.data || []);
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error fetching permissions:", error);
            }
        });
    };

    const handleEditRole = (role) => {
        console.log(`✏️ [AdminRoles] Opening edit modal for role:`, role);
        setSelectedRole(role);
        setEditForm({ name: role.name || '' });
        setShowEditModal(true);
        setActiveDropdown(null);
    };

    const handleUpdateRole = () => {
        console.log(`💾 [AdminRoles] Updating role with ID: ${selectedRole.id}`, editForm);
        
        mutate({
            url: `/admin/role/update`,
            method: 'PUT',
            data: {
                roleId: selectedRole.id,
                ...editForm
            },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully updated role:", response.data);
                setShowEditModal(false);
                setSelectedRole(null);
                setEditForm({ name: '' });
                fetchRoles();
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error updating role:", error);
            }
        });
    };

    const handleDeleteRole = (roleId) => {
        console.log(`🗑️ [AdminRoles] Attempting to delete role with ID: ${roleId}`);
        
        const confirmDelete = () => {
            mutate({
                url: `/admin/role/delete/permission?roleId=${roleId}`,
                method: 'DELETE',
                headers: true,
                onSuccess: (response) => {
                    console.log("✅ [AdminRoles] Successfully deleted role:", response.data);
                    fetchRoles();
                },
                onError: (error) => {
                    console.error("❌ [AdminRoles] Error deleting role:", error);
                }
            });
        };

        openModal({
            size: "sm",
            content: (
                <ConfirmModal
                    title="Delete Role"
                    message="Are you sure you want to delete this role? This action cannot be undone."
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    confirmColor="red"
                />
            )
        });
        
        setActiveDropdown(null);
    };

    const handleCreatePermission = () => {
        console.log(`🆕 [AdminRoles] Creating new permission:`, permissionForm);
        
        mutate({
            url: `/admin/permission/create`,
            method: 'POST',
            data: permissionForm,
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully created permission:", response.data);
                setShowPermissionModal(false);
                setPermissionForm({ name: '' });
                fetchPermissions();
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error creating permission:", error);
            }
        });
    };

    const handleEditPermission = (permission) => {
        console.log(`✏️ [AdminRoles] Opening edit modal for permission:`, permission);
        setSelectedPermission(permission);
        setPermissionForm({ name: permission.name || '' });
        setShowPermissionModal(true);
    };

    const handleUpdatePermission = () => {
        console.log(`💾 [AdminRoles] Updating permission with ID: ${selectedPermission.id}`, permissionForm);
        
        mutate({
            url: `/admin/permission/update`,
            method: 'PUT',
            data: {
                permissionId: selectedPermission.id,
                ...permissionForm
            },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully updated permission:", response.data);
                setShowPermissionModal(false);
                setSelectedPermission(null);
                setPermissionForm({ name: '' });
                fetchPermissions();
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error updating permission:", error);
            }
        });
    };

    const handleDeletePermission = (permissionId) => {
        console.log(`🗑️ [AdminRoles] Attempting to delete permission with ID: ${permissionId}`);
        
        const confirmDelete = () => {
            mutate({
                url: `/admin/permission/delete?permissionId=${permissionId}`,
                method: 'DELETE',
                headers: true,
                onSuccess: (response) => {
                    console.log("✅ [AdminRoles] Successfully deleted permission:", response.data);
                    fetchPermissions();
                },
                onError: (error) => {
                    console.error("❌ [AdminRoles] Error deleting permission:", error);
                }
            });
        };

        openModal({
            size: "sm",
            content: (
                <ConfirmModal
                    title="Delete Permission"
                    message="Are you sure you want to delete this permission? This action cannot be undone."
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    confirmColor="red"
                />
            )
        });
    };

    const handleAssignPermission = () => {
        console.log(`🔗 [AdminRoles] Assigning permission to role:`, assignForm);
        
        mutate({
            url: `/admin/role/assign/permission`,
            method: 'POST',
            data: assignForm,
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully assigned permission to role:", response.data);
                setShowAssignPermissionModal(false);
                setAssignForm({ roleId: '', permissionId: '' });
                fetchRoles();
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error assigning permission to role:", error);
            }
        });
    };

    const handleRemovePermissionFromRole = (roleId, permissionId) => {
        console.log(`🗑️ [AdminRoles] Attempting to remove permission ${permissionId} from role ${roleId}`);
        
        const confirmDelete = () => {
            mutate({
                url: `/admin/role/delete/permission?roleId=${roleId}&permissionId=${permissionId}`,
                method: 'DELETE',
                headers: true,
                onSuccess: (response) => {
                    console.log("✅ [AdminRoles] Successfully removed permission from role:", response.data);
                    // Refresh the role permissions by calling handleViewPermissions again
                    handleViewPermissions(selectedRole);
                },
                onError: (error) => {
                    console.error("❌ [AdminRoles] Error removing permission from role:", error);
                }
            });
        };

        openModal({
            size: "sm",
            content: (
                <ConfirmModal
                    title="Remove Permission"
                    message="Are you sure you want to remove this permission from the role? This action cannot be undone."
                    onConfirm={confirmDelete}
                    confirmText="Remove"
                    confirmColor="red"
                />
            )
        });
    };

    const toggleDropdown = (roleId) => {
        setActiveDropdown(activeDropdown === roleId ? null : roleId);
    };

    const openCreatePermissionModal = () => {
        setSelectedPermission(null);
        setPermissionForm({ name: '' });
        setShowPermissionModal(true);
    };

    const handleViewPermissions = (role) => {
        console.log(`👁️ [AdminRoles] Viewing permissions for role:`, role);
        setSelectedRole(role);
        setRolePermissions([]); // Reset permissions first
        setShowViewPermissionsModal(true);
        
        // Fetch permissions for this role
        console.log(`🔍 [AdminRoles] About to fetch permissions for role ID: ${role.id}`);
        mutate({
            url: `/admin/role/view/permissions?roleId=${role.id}`,
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [AdminRoles] Successfully fetched role permissions:", response.data);
                console.log("✅ [AdminRoles] Full response structure:", response);
                
                // Handle different possible response structures
                let permissions = [];
                if (response.data?.data?.permissions) {
                    // If permissions are nested under data.permissions
                    permissions = response.data.data.permissions;
                    console.log("✅ [AdminRoles] Using data.data.permissions structure");
                } else if (Array.isArray(response.data?.data)) {
                    // If data.data is directly an array
                    permissions = response.data.data;
                    console.log("✅ [AdminRoles] Using data.data array structure");
                } else if (Array.isArray(response.data?.permissions)) {
                    // If permissions are directly under data
                    permissions = response.data.permissions;
                    console.log("✅ [AdminRoles] Using data.permissions structure");
                } else {
                    console.log("⚠️ [AdminRoles] Unknown response structure, defaulting to empty array");
                }
                
                console.log("✅ [AdminRoles] Setting permissions:", permissions);
                setRolePermissions(permissions);
            },
            onError: (error) => {
                console.error("❌ [AdminRoles] Error fetching role permissions:", error);
                console.error("❌ [AdminRoles] Full error object:", error);
                console.error("❌ [AdminRoles] Error response:", error.response);
                console.error("❌ [AdminRoles] Error status:", error.response?.status);
                console.error("❌ [AdminRoles] Error data:", error.response?.data);
                
                // Set to null to indicate error vs empty array for no permissions
                if (error.response?.status === 403) {
                    setRolePermissions(null); // null indicates permission error
                } else {
                    setRolePermissions([]); // empty array indicates no permissions
                }
            }
        });
        setActiveDropdown(null);
    };

    // Filter roles based on search term
    const filteredRoles = roles.filter(role =>
        role.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Admin Roles & Permissions</h1>
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
                                onClick={openCreatePermissionModal}
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Permission
                            </button>
                            <Link
                                to="/admin/permissions"
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Manage Permissions
                            </Link>
                            <button 
                                onClick={() => setShowAssignPermissionModal(true)}
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Assign Permission
                            </button>
                            <Link
                                to="/admin/sub-admins/create-role"
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Role
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">Admin Role Name</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[150px]">Date Added</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">Action</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-8 text-gray-500">
                                        {searchTerm ? `No roles found matching "${searchTerm}"` : 'No roles found'}
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
                                        <td className="py-4 px-6 text-gray-600">{formatDate(role.createdAt)}</td>
                                        <td className="py-4 px-6">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleDropdown(role.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                    </svg>
                                                </button>
                                                {activeDropdown === role.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                        <button 
                                                            onClick={() => handleViewPermissions(role)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Permissions
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEditRole(role)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit Role
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRole(role.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* View Permissions Modal */}
                {showViewPermissionsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Permissions for "{selectedRole?.name}"
                                    </h3>
                                    {Array.isArray(rolePermissions) && rolePermissions.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {rolePermissions.length} permission{rolePermissions.length !== 1 ? 's' : ''} assigned
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setShowViewPermissionsModal(false);
                                        setRolePermissions([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="p-6">
                                    {!Array.isArray(rolePermissions) || rolePermissions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-lg font-medium mb-2">
                                                {rolePermissions === null ? "Access Denied" : "No permissions assigned"}
                                            </p>
                                            <p className="text-sm text-gray-400 mb-4">
                                                {rolePermissions === null ? 
                                                    "You don't have permission to view role permissions. Contact your administrator." : 
                                                    "This role has no permissions yet"
                                                }
                                            </p>
                                            {rolePermissions !== null && (
                                                <button 
                                                    onClick={() => {
                                                        setShowViewPermissionsModal(false);
                                                        setShowAssignPermissionModal(true);
                                                        setAssignForm({...assignForm, roleId: selectedRole?.id});
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                    Assign permissions to this role
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                                {rolePermissions.map((permission, index) => {
                                                    // Handle both direct permission objects and nested structures
                                                    const permissionName = permission?.name || permission?.permission?.name || `Permission ${index + 1}`;
                                                    const permissionId = permission?.id || permission?.permission?.id || index;
                                                    
                                                    return (
                                                        <div key={permissionId} className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start space-x-3 flex-1">
                                                                    <div className="shrink-0 mt-0.5">
                                                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="text-sm font-semibold text-gray-900 mb-1 break-words">
                                                                            {permissionName}
                                                                        </h4>
                                                                        {permission?.createdAt && (
                                                                            <p className="text-xs text-gray-500 flex items-center">
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                                                        onClick={() => handleRemovePermissionFromRole(selectedRole?.id, permissionId)}
                                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                                                                        title="Remove permission from role"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 shrink-0">
                                <button
                                    onClick={() => {
                                        setShowViewPermissionsModal(false);
                                        setRolePermissions([]);
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                {Array.isArray(rolePermissions) && rolePermissions.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setShowViewPermissionsModal(false);
                                            setShowAssignPermissionModal(true);
                                            setAssignForm({...assignForm, roleId: selectedRole?.id});
                                        }}
                                        className="inline-flex items-center px-5 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Assign More
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Role Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Role</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter role name"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateRole}
                                    className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Update Role
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create/Edit Permission Modal */}
                {showPermissionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedPermission ? 'Edit Permission' : 'Create Permission'}
                                </h3>
                                <button
                                    onClick={() => setShowPermissionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Permission Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={permissionForm.name}
                                        onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter permission name (e.g., delete-role-permissions)"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowPermissionModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={selectedPermission ? handleUpdatePermission : handleCreatePermission}
                                    className="px-6 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    {selectedPermission ? 'Update Permission' : 'Create Permission'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Permission Modal */}
                {showAssignPermissionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Assign Permission to Role</h3>
                                <button
                                    onClick={() => setShowAssignPermissionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Role *
                                    </label>
                                    <select
                                        value={assignForm.roleId}
                                        onChange={(e) => setAssignForm({...assignForm, roleId: e.target.value})}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Permission *
                                    </label>
                                    <select
                                        value={assignForm.permissionId}
                                        onChange={(e) => setAssignForm({...assignForm, permissionId: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select a permission</option>
                                        {permissions.map((permission) => (
                                            <option key={permission.id} value={permission.id}>
                                                {permission.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowAssignPermissionModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignPermission}
                                    className="px-6 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Assign Permission
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Permissions Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">All Permissions</h3>
                            <button 
                                onClick={openCreatePermissionModal}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                + Add Permission
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">Permission Name</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[150px]">Date Created</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {permissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-gray-500">
                                            No permissions found
                                        </td>
                                    </tr>
                                ) : (
                                    permissions.map((permission, index) => (
                                        <tr key={permission.id || index} className="hover:bg-gray-50">
                                            <td className="py-4 px-6 text-gray-900">{permission.name}</td>
                                            <td className="py-4 px-6 text-gray-600">{formatDate(permission.createdAt)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEditPermission(permission)}
                                                        className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeletePermission(permission.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRoles;