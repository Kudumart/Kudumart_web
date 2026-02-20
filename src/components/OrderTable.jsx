import React from 'react';
import { dateFormat } from '../helpers/dateHelper';
import { useNavigate } from 'react-router-dom';
import Table from './ReviewTable';

const OrderTable = ({ data, loading }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className='All'>
                <div className="rounded-md pb-2 w-full gap-5"><h2 className="text-lg font-semibold text-black-700 mb-4">Orders </h2></div>
                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <h2 className="text-lg font-semibold text-black-700">All Orders </h2>
                    <div className="overflow-x-auto">

                        <Table
                            columns={[
                                { key: 'refId', label: 'Order ID' },
                                { key: 'trackingNumber', label: 'Tracking Number' },
                                {
                                    key: 'orderItemsCount', label: 'Order Items'
                                },
                                { key: 'totalAmount', label: 'Price' },
                                { key: 'createdAt', label: 'Date' },
                            ]}
                            isLoading={loading}
                            exportData
                            allData={data.map((item) => ({
                                ...item,
                                createdAt: `${dateFormat(item.createdAt, "dd-MM-YYY")}`,
                            }))
                            }
                            data={data.map((item) => ({
                                ...item,
                                createdAt: `${dateFormat(item.createdAt, "dd-MM-YYY")}`,
                            }))
                            }
                            actions={[
                                {
                                    label: () => "View Order",
                                    onClick: (row) => navigate(`orderDetails/general/${row.id}`),
                                },
                            ]}
                            currentPage={null}
                            totalPages={null}
                            onPageChange={null}
                        />

                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderTable;