import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useModal } from '../../../hooks/modal';
import ConfirmModal from '../../../components/ConfirmModal';

const SubAdmins = () => {
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', roleId: '' });
    const [roles, setRoles] = useState([]);
    const { mutate } = useApiMutation();
    const { openModal } = useModal();

    useEffect(() => {
        console.log("🚀 [SubAdmins] Component mounted, initializing...");
        getSubAdmins();
        getRoles();
    }, [currentPage, searchTerm, sortBy]);

    useEffect(() => {
        console.log("🔍 [SubAdmins] Search or pagination changed:", {
            currentPage,
            searchTerm,
            itemsPerPage
        });
    }, [currentPage, searchTerm, itemsPerPage]);

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

    const getSubAdmins = () => {
        console.log("🔍 [SubAdmins] Fetching sub admins list...");
        setLoading(true);
        mutate({
            url: `/admin/sub-admins?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&sort=${sortBy}`,
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [SubAdmins] Successfully fetched sub admins:", response.data);
                setSubAdmins(response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
                setLoading(false);
            },
            onError: (error) => {
                console.error("❌ [SubAdmins] Error fetching sub admins:", error);
                setLoading(false);
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter sub admins based on search term
    const filteredSubAdmins = subAdmins.filter(admin => 
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (adminId) => {
        console.log(`🗑️ [SubAdmins] Attempting to delete sub admin with ID: ${adminId}`);
        
        const confirmDelete = () => {
            mutate({
                url: `/admin/sub-admin/delete?subAdminId=${adminId}`,
                method: 'DELETE',
                headers: true,
                onSuccess: (response) => {
                    console.log("✅ [SubAdmins] Successfully deleted sub admin:", response.data);
                    // Refresh the list after successful deletion
                    getSubAdmins();
                },
                onError: (error) => {
                    console.error("❌ [SubAdmins] Error deleting sub admin:", error);
                }
            });
        };

        openModal({
            size: "sm",
            content: (
                <ConfirmModal
                    title="Delete Sub Admin"
                    message="Are you sure you want to remove this admin? This action cannot be undone."
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                    confirmColor="red"
                />
            )
        });
        
        setActiveDropdown(null);
    };

    const toggleUserStatus = (adminId, currentStatus) => {
        console.log(`🔄 [SubAdmins] Attempting to toggle status for admin ID: ${adminId}, current status: ${currentStatus}`);
        
        const action = currentStatus === 'active' ? 'suspend' : 'activate';
        const confirmMessage = currentStatus === 'active' 
            ? 'Are you sure you want to suspend this admin?' 
            : 'Are you sure you want to activate this admin?';
            
        const confirmToggle = () => {
            mutate({
                url: `/admin/sub-admin/status`,
                method: 'PATCH',
                data: { subAdminId: adminId },
                headers: true,
                onSuccess: (response) => {
                    console.log(`✅ [SubAdmins] Successfully ${action}d sub admin:`, response.data);
                    // Refresh the list after successful status change
                    getSubAdmins();
                },
                onError: (error) => {
                    console.error(`❌ [SubAdmins] Error ${action}ing sub admin:`, error);
                }
            });
        };

        openModal({
            size: "sm",
            content: (
                <ConfirmModal
                    title={`${action === 'suspend' ? 'Suspend' : 'Activate'} Sub Admin`}
                    message={confirmMessage}
                    onConfirm={confirmToggle}
                    confirmText={action === 'suspend' ? 'Suspend' : 'Activate'}
                    confirmColor={action === 'suspend' ? 'red' : 'green'}
                />
            )
        });
        
        setActiveDropdown(null);
    };

    const getRoles = () => {
        console.log("🔍 [SubAdmins] Fetching roles for edit modal...");
        mutate({
            url: '/admin/roles',
            method: 'GET',
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [SubAdmins] Successfully fetched roles:", response.data);
                setRoles(response.data.data || []);
            },
            onError: (error) => {
                console.error("❌ [SubAdmins] Error fetching roles:", error);
            }
        });
    };

    const handleEditAdmin = (admin) => {
        console.log(`✏️ [SubAdmins] Opening edit modal for admin:`, admin);
        setSelectedAdmin(admin);
        setEditForm({
            name: admin.name || '',
            email: admin.email || '',
            roleId: admin.roleId || ''
        });
        setShowEditModal(true);
        setActiveDropdown(null);
    };

    const handleUpdateAdmin = () => {
        console.log(`💾 [SubAdmins] Updating admin with ID: ${selectedAdmin.id}`, editForm);
        
        mutate({
            url: `/admin/sub-admin/update`,
            method: 'PUT',
            data: {
                subAdminId: selectedAdmin.id,
                ...editForm
            },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [SubAdmins] Successfully updated sub admin:", response.data);
                setShowEditModal(false);
                setSelectedAdmin(null);
                setEditForm({ name: '', email: '', roleId: '' });
                // Refresh the list after successful update
                getSubAdmins();
            },
            onError: (error) => {
                console.error("❌ [SubAdmins] Error updating sub admin:", error);
            }
        });
    };

    const toggleDropdown = (adminId) => {
        setActiveDropdown(activeDropdown === adminId ? null : adminId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Employees/Admin</h1>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex gap-3 flex-1">
                            <input
                                type="text"
                                placeholder="Search subadmin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 flex-1"
                            />
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white min-w-0 w-40 truncate"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name">Name A-Z</option>
                                    <option value="email">Email A-Z</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowRoleModal(true)}
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-transparent"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Role
                            </button>
                            <Link
                                to="/admin/sub-admins/create"
                                className="inline-flex items-center px-5 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 border border-transparent"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add New Admin
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[80px]">Profile</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">Name</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[200px]">Email Address</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[100px]">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[120px]">Date Joined</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-900 min-w-[100px]">Action</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        {searchTerm ? `No admins found matching "${searchTerm}"` : 'No sub admins found'}
                                        <div className="mt-2">
                                            <Link 
                                                to="/admin/sub-admins/create"
                                                className="text-orange-600 hover:text-orange-700 underline"
                                            >
                                                Create your first sub admin
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubAdmins.map((admin, index) => (
                                    <tr key={admin.id || index} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-900">{admin.name || 'N/A'}</td>
                                        <td className="py-4 px-6 text-gray-600">{admin.email || 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                admin.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {admin.status === 'active' ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{admin.createdAt ? formatDate(admin.createdAt) : 'N/A'}</td>
                                        <td className="py-4 px-6">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => toggleDropdown(admin.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                                                    </svg>
                                                </button>
                                                {/* Dropdown menu */}
                                                {activeDropdown === admin.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                        <button 
                                                            onClick={() => handleEditAdmin(admin)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit Admin
                                                        </button>
                                                        <button
                                                            onClick={() => toggleUserStatus(admin.id, admin.status)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                            {admin.status === 'active' ? 'Suspend Admin' : 'Unsuspend Admin'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(admin.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Remove Admin
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

                {/* Edit Admin Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Edit Admin</h3>
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
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                                            placeholder="Enter email address"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role *
                                        </label>
                                        <select
                                            value={editForm.roleId}
                                            onChange={(e) => setEditForm({...editForm, roleId: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="">Select a role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                                    onClick={handleUpdateAdmin}
                                    className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Update Admin
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Role Selection Modal */}
                {showRoleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Select a Role</h3>
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {roles.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No roles found</p>
                                            <p className="text-sm text-gray-400 mt-2">Create a role first before assigning it</p>
                                        </div>
                                    ) : (
                                        roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                <input
                                                    type="radio"
                                                    name="selectedRole"
                                                    value={role.id}
                                                    className="h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{role.name}</p>
                                                    <p className="text-sm text-gray-500">Created: {formatDate(role.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        const selectedRole = document.querySelector('input[name="selectedRole"]:checked');
                                        if (selectedRole) {
                                            window.location.href = `/admin/sub-admins/roles?roleId=${selectedRole.value}`;
                                        }
                                        setShowRoleModal(false);
                                    }}
                                    className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    Select Role
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubAdmins;
