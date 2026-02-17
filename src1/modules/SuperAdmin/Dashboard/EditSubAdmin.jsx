import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useModal } from '../../../hooks/modal';
import NotificationModal from '../../../components/NotificationModal';

const EditSubAdmin = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
    const { mutate } = useApiMutation();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const { subAdminId } = useParams();

    useEffect(() => {
        console.log("🚀 [EditSubAdmin] Component mounted, initializing...");
        console.log("📋 [EditSubAdmin] Sub Admin ID from params:", subAdminId);
        if (subAdminId) {
            fetchRoles();
            getSubAdmin();
        }
    }, [subAdminId]);

    const fetchRoles = () => {
        console.log("🔍 [EditSubAdmin] Fetching roles from /admin/roles...");
        mutate({
            url: '/admin/roles',
            method: 'GET',
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [EditSubAdmin] Successfully fetched roles:", response.data);
                setRoles(response.data.data || []);
            },
            onError: (error) => {
                console.error('❌ [EditSubAdmin] Error fetching roles:', error);
            }
        });
    };

    const getSubAdmin = () => {
        console.log(`🔍 [EditSubAdmin] Fetching sub admin details for ID: ${subAdminId}`);
        setLoading(true);
        mutate({
            url: `/admin/sub-admins/${subAdminId}`,
            method: "GET",
            headers: true,
            hideToast: true,
            onSuccess: (response) => {
                console.log("✅ [EditSubAdmin] Successfully fetched sub admin details:", response.data);
                const subAdmin = response.data.data;
                setValue('name', subAdmin.name);
                setValue('email', subAdmin.email);
                setValue('roleId', subAdmin.role?._id);
                setLoading(false);
            },
            onError: (error) => {
                console.error("❌ [EditSubAdmin] Error fetching sub admin details:", error);
                setLoading(false);
            },
        });
    };

    const onSubmit = (data) => {
        console.log("📝 [EditSubAdmin] Submitting edit sub admin form:", {
            subAdminId,
            email: data.email,
            roleId: data.roleId,
            selectedRole: roles.find(role => role._id === data.roleId)?.name || 'Unknown'
        });
        
        setLoading(true);
        
        mutate({
            url: `/admin/sub-admins/${subAdminId}`,
            method: "PUT",
            data: {
                subAdminId: subAdminId,
                name: data.name,
                email: data.email,
                roleId: data.roleId
            },
            headers: true,
            onSuccess: (response) => {
                setLoading(false);
                openModal({
                    size: "sm",
                    content: (
                        <NotificationModal
                            title="Success"
                            message="Sub admin updated successfully!"
                            type="success"
                            buttonText="Continue"
                        />
                    )
                });
                navigate('/admin/sub-admins');
            },
            onError: (error) => {
                setLoading(false);
                console.error('❌ [EditSubAdmin] Error updating sub admin:', error);
                openModal({
                    size: "sm",
                    content: (
                        <NotificationModal
                            title="Error"
                            message="Error updating sub admin. Please try again."
                            type="error"
                            buttonText="OK"
                        />
                    )
                });
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`📝 [EditSubAdmin] Form field changed:`, { field: name, value });
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kudu-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Sub Admin</h1>
                    <p className="text-gray-600 mt-1">Update sub administrator details</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-kudu-orange focus:border-transparent"
                                placeholder="Enter full name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email', { 
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-kudu-orange focus:border-transparent"
                                placeholder="Enter email address"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
                                Assign Role
                            </label>
                            <select
                                id="roleId"
                                {...register('roleId', { required: 'Role is required' })}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-kudu-orange focus:border-transparent"
                            >
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.roleId && (
                                <p className="mt-1 text-sm text-red-600">{errors.roleId.message}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/sub-admins')}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-kudu-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Update Sub Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditSubAdmin;
