import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useModal } from '../../../hooks/modal';
import NotificationModal from '../../../components/NotificationModal';

const CreateSubAdmin = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { mutate } = useApiMutation();
    const { openModal } = useModal();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roleId: ''
    });

    useEffect(() => {
        console.log("🚀 [CreateSubAdmin] Component mounted, initializing...");
        fetchRoles();
    }, []);

    const fetchRoles = () => {
        console.log("🔍 [CreateSubAdmin] Fetching roles from /admin/roles...");
        mutate({
            url: '/admin/roles',
            method: 'GET',
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [CreateSubAdmin] Successfully fetched roles:", response.data);
                setRoles(response.data.data || []);
            },
            onError: (error) => {
                console.error("❌ [CreateSubAdmin] Error fetching roles:", error);
            }
        });
    };

    const onSubmit = (data) => {
        console.log("📝 [CreateSubAdmin] Submitting create sub admin form:", {
            email: data.email,
            roleId: data.roleId,
            selectedRole: roles.find(role => role.id === data.roleId)?.name || 'Unknown'
        });
        
        setLoading(true);
        mutate({
            url: '/admin/sub-admin/create',
            method: 'POST',
            headers: true,
            data: {
                name: data.name,
                email: data.email,
                roleId: data.roleId
            },
            onSuccess: (response) => {
                setLoading(false);
                console.log("✅ [CreateSubAdmin] Successfully created sub admin:", response.data);
                openModal({
                    size: "sm",
                    content: (
                        <NotificationModal
                            title="Success"
                            message="Sub admin created successfully!"
                            type="success"
                            buttonText="Continue"
                        />
                    )
                });
                navigate('/admin/sub-admins');
            },
            onError: (error) => {
                setLoading(false);
                console.error('❌ [CreateSubAdmin] Error creating sub admin:', error);
                openModal({
                    size: "sm",
                    content: (
                        <NotificationModal
                            title="Error"
                            message="Error creating sub admin. Please try again."
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
        console.log(`📝 [CreateSubAdmin] Form field changed:`, { field: name, value });
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create Sub Admin</h1>
                    <p className="text-gray-600 mt-1">Add a new sub administrator to the system</p>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                                className="px-6 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating...' : 'Create Sub Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateSubAdmin;
