import React, { useState, useEffect } from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useModal } from '../../../hooks/modal';
import ConfirmModal from '../../../components/ConfirmModal';

const Permissions = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [editForm, setEditForm] = useState({ name: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const { mutate } = useApiMutation();
    const { openModal } = useModal();

    useEffect(() => {
        console.log("🚀 [Permissions] Component mounted, initializing...");
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

    const fetchPermissions = () => {
        console.log("🔍 [Permissions] Fetching permissions from /admin/permissions...");
        setLoading(true);
        mutate({
            url: '/admin/permissions',
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [Permissions] Successfully fetched permissions:", response.data);
                setPermissions(response.data.data || []);
                setLoading(false);
            },
            onError: (error) => {
                console.error("❌ [Permissions] Error fetching permissions:", error);
                setLoading(false);
            }
        });
    };

    const handleCreatePermission = (permissionName) => {
        console.log(`🆕 [Permissions] Creating new permission:`, { name: permissionName });
        
        mutate({
            url: `/admin/permission/create`,
            method: 'POST',
            data: { name: permissionName },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [Permissions] Successfully created permission:", response.data);
                fetchPermissions();
            },
            onError: (error) => {
                console.error("❌ [Permissions] Error creating permission:", error);
            }
        });
    };

    const handleEditPermission = (permission) => {
        console.log(`✏️ [Permissions] Opening edit modal for permission:`, permission);
        setSelectedPermission(permission);
        setEditForm({ name: permission.name || '' });
        setShowEditModal(true);
        setActiveDropdown(null);
    };

    const handleUpdatePermission = () => {
        console.log(`💾 [Permissions] Updating permission with ID: ${selectedPermission.id}`, editForm);
        
        mutate({
            url: `/admin/permission/update`,
            method: 'PUT',
            data: {
                permissionId: selectedPermission.id,
                ...editForm
            },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [Permissions] Successfully updated permission:", response.data);
                setShowEditModal(false);
                setSelectedPermission(null);
                setEditForm({ name: '' });
                fetchPermissions();
            },
            onError: (error) => {
                console.error("❌ [Permissions] Error updating permission:", error);
            }
        });
    };

    const handleDeletePermission = (permissionId) => {
        console.log(`🗑️ [Permissions] Attempting to delete permission with ID: ${permissionId}`);
        
        const confirmDelete = () => {
            mutate({
                url: `/admin/permission/delete?permissionId=${permissionId}`,
                method: 'DELETE',
                headers: true,
                onSuccess: (response) => {
                    console.log("✅ [Permissions] Successfully deleted permission:", response.data);
                    fetchPermissions();
                },
                onError: (error) => {
                    console.error("❌ [Permissions] Error deleting permission:", error);
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
        
        setActiveDropdown(null);
    };

    const toggleDropdown = (permissionId) => {
        setActiveDropdown(activeDropdown === permissionId ? null : permissionId);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
                        <p className="text-gray-600 mt-1">Manage system permissions</p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                        />
                        <button 
                            onClick={() => {
                                const name = prompt('Enter permission name:');
                                if (name) handleCreatePermission(name);
                            }}
                            className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Permission
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">Permission Name</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">Description</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[150px]">Date Created</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">Actions</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPermissions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                        {searchTerm ? `No permissions found matching "${searchTerm}"` : 'No permissions found'}
                                        <div className="mt-2">
                                            <button 
                                                onClick={() => {
                                                    const name = prompt('Enter permission name:');
                                                    if (name) handleCreatePermission(name);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Create your first permission
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissions.map((permission, index) => (
                                    <tr key={permission.id || index} className="hover:bg-gray-50">
                                        <td className="py-4 px-6 text-gray-900 font-medium">{permission.name}</td>
                                        <td className="py-4 px-6 text-gray-600">{permission.description || 'No description'}</td>
                                        <td className="py-4 px-6 text-gray-600">{formatDate(permission.createdAt)}</td>
                                        <td className="py-4 px-6">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleDropdown(permission.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                    </svg>
                                                </button>
                                                {activeDropdown === permission.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                        <button 
                                                            onClick={() => handleEditPermission(permission)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit Permission
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePermission(permission.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete Permission
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
                            <span className="text-sm text-gray-700">
                                Showing {filteredPermissions.length} of {permissions.length} permissions
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                Total: {permissions.length} permissions
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Permission Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Permission</h3>
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
                                        Permission Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter permission name"
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
                                    onClick={handleUpdatePermission}
                                    className="px-6 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Update Permission
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Permissions;
