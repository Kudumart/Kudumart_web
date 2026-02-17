import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApiMutation from '../../../api/hooks/useApiMutation';

const CreateRole = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: ''
    });
    const { mutate } = useApiMutation();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`📝 [CreateRole] Form field changed:`, { field: name, value });
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log("📝 [CreateRole] Submitting create role form:", {
            name: formData.name
        });
        
        setLoading(true);
        
        mutate({
            url: `/admin/role/create`,
            method: "POST",
            data: { name: formData.name },
            headers: true,
            onSuccess: (response) => {
                console.log("✅ [CreateRole] Successfully created role:", response.data);
                navigate("/admin/sub-admins/roles");
            },
            onError: (error) => {
                console.error("❌ [CreateRole] Error creating role:", error);
                setLoading(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
                    <p className="text-gray-600 mt-1">Define a new role</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Role Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter role name"
                            />
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/admin/sub-admins/roles")}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRole;
