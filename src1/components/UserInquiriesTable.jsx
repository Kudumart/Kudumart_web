import React from 'react';
import { RiDeleteBin5Line } from "react-icons/ri";
import { dateFormat } from "../helpers/dateHelper";
import { useModal } from "../hooks/modal";
import DeleteModal from "./DeleteModal";
import ReviewTable from "./ReviewTable";

const UserInquiriesTable = ({ data = [], loading = false, refetch }) => {
    const { openModal } = useModal();

    const handleDeleteModal = (id) => {
        openModal({
            size: "sm",
            content: (
                <DeleteModal 
                    title={'Do you want to delete this inquiry'} 
                    redirect={refetch} 
                    api={`/admin/contact/us/form?id=${id}`} 
                />
            )
        });
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { 
            key: 'message', 
            label: 'Message',
            render: (value) => (
                <div className="max-w-xs">
                    <div 
                        className="text-sm text-gray-700 line-clamp-3"
                        dangerouslySetInnerHTML={{
                            __html: value?.slice(0, 150) + (value?.length > 150 ? '...' : '')
                        }}
                    />
                </div>
            )
        },
        { 
            key: 'createdAt', 
            label: 'Date Submitted',
            render: (value) => dateFormat(value, "dd-MM-yyyy")
        }
    ];

    const actions = [
        {
            label: () => 'Delete',
            onClick: (row) => handleDeleteModal(row.id),
            className: 'text-red-600 hover:text-red-800'
        }
    ];

    return (
        <div className="bg-white rounded-md p-6 w-full">
            <ReviewTable
                title="User Inquiries"
                columns={columns}
                data={data || []}
                allData={data || []}
                exportData={true}
                isLoading={loading}
                hasNumber={true}
                actions={actions}
                currentPage={1}
                totalPages={1}
                onPageChange={null}
            />
        </div>
    );
};

export default UserInquiriesTable;
