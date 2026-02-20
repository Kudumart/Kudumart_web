import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DeleteModal from './DeleteModal';
import { useModal } from '../hooks/modal';
import Table from './ReviewTable';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { Button } from '@material-tailwind/react';
import useApiMutation from '../api/hooks/useApiMutation';

const AdminAdverts = ({ data, paginate, totalData, loading, refetch }) => {
    const navigate = useNavigate();
    const { openModal, closeModal } = useModal();
    const { mutate } = useApiMutation();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm();


    const handleRedirect = () => {
        refetch(paginate.page);
    };

    const handleDeleteModal = (id) => {
        openModal({
            size: "sm",
            content: <DeleteModal title={'Do you wish to delete this advert?'} redirect={handleRedirect}
                api={`/admin/adverts?advertId=${id}`} />
        })
    }


    const publishAD = (id) => {
        openModal({
            size: "sm",
            content: <Modal title={'Do you wish to publish this advert?'} redirect={handleRedirect}
                api={`/admin/approved-reject/advert`} method={'POST'} body={{ advertId: id, status: 'approved' }} />
        })
    }


    const unPublishADModal = (id) => {
        const unpublishAD = (data) => {
            const payload = { ...data, advertId: id, status: 'rejected' };
            mutate({
                url: '/admin/approved-reject/advert',
                method: 'POST',
                data: payload,
                headers: true,
                onSuccess: (response) => {
                    refetch(paginate.page)
                    closeModal();
                },
                onError: () => {
                    closeModal();
                }
            });
        }

        openModal({
            size: "sm",
            content: <div className="w-full flex max-h-[90vh] flex-col px-3 py-6 gap-3 -mt-3">
                <div className="flex gap-5">
                    <div className="flex flex-col justify-start">
                        <h2 className="font-semibold">Unpublish AD</h2>
                    </div>
                </div>
                <form onSubmit={handleSubmit(unpublishAD)}>
                    <div className="flex flex-col gap-4 mt-3">
                        <div className="mb-4">
                            <label
                                className="block text-md mb-3"
                                htmlFor="email"
                            >
                                Admin Note
                            </label>
                            <input
                                type="text"
                                id="reason"
                                {...register("adminNote", { required: "Reason to unpublish AD is required" })}
                                placeholder="Reason to unpublish this AD"
                                className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-lg focus:outline-hidden placeholder-gray-400 text-sm mb-3"
                                style={{ outline: "none" }}
                                required
                            />
                            {errors.adminNote && (
                                <p className="text-red-500 text-sm">{errors.adminNote.message}</p>
                            )}
                        </div>
                        <div className="w-full flex justify-center gap-4 mt-1">
                            <Button type="submit"
                                className="bg-kudu-orange p-3 rounded-lg"
                            >
                                Unpublish AD
                            </Button>
                            <button
                                onClick={closeModal}
                                type='button'
                                className="bg-gray-300 text-black px-4 py-2 font-medium rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        })
    }


    const handleAction = (data) => {
        if (data.vendor) {
            if (data.status === 'pending' || data.status === 'rejected') {
                publishAD(data.id)
            }
            else {
                unPublishADModal(data.id)
            }
        }
        else {
            navigate(`edit/${data.id}`)
        }
    }


    return (
        <div className="min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-semibold text-black-700 mb-4">Adverts</h1>
                <Link
                    to="/admin/postadverts"
                    className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 text-center inline-block"
                >
                    Post New Advert
                </Link>
            </div>
            <div className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-black-700">All Uploaded Adverts</h2>
                </div>
                <div className="overflow-x-auto">

                    <Table
                        columns={[
                            { key: 'title', label: 'Advert Name' },
                            {
                                key: 'media_url', label: 'Advert Image', render: (value) => (
                                    <span>
                                        <img src={value} alt="Advert" className="w-10 h-10 object-cover mx-auto" />
                                    </span>
                                ),
                            },
                            {
                                key: 'vendor',
                                label: 'Vendor Name',
                                render: (value) => (
                                    <span className="py-2 px-4 rounded-md text-sm capitalize">
                                        {value ? `${value.firstName} ${value.lastName}` : 'N/A'}
                                    </span>
                                ),
                            },
                            { key: 'sub_category', label: 'Advert Category' },
                            {
                                key: 'duration', label: 'Duration'
                            },
                            {
                                key: 'status', label: 'Status', render: (value) => (
                                    <span
                                        className={`py-2 px-4 rounded-md text-sm capitalize ${value === 'approved'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}
                                    >
                                        {value}
                                    </span>
                                )
                            }
                        ]}
                        allData={totalData.map((item) => ({
                            ...item,
                            sub_category: item.sub_category.name
                        }))
                        }
                        data={data.map((item) => ({
                            ...item,
                            sub_category: item.sub_category.name
                        }))
                        }
                        isLoading={loading}
                        exportData
                        actions={[
                            {
                                label: (row) => {
                                    return row.vendor ? row.status === 'pending' || row.status === 'rejected' ? 'Publish AD' : 'Unpublish AD' : 'Edit';
                                },
                                onClick: (row) => handleAction(row),
                            },
                            {
                                label: (row) => {
                                    return 'Delete';
                                },
                                onClick: (row) => handleDeleteModal(row.id),
                            },
                        ]}
                        currentPage={paginate.page}
                        totalPages={paginate.pages}
                        onPageChange={(page) => refetch(page)}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminAdverts;
