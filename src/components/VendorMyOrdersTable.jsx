import React from 'react';
import { dateFormat } from "../helpers/dateHelper";
import ReviewTable from "./ReviewTable";
import Button from "./Button";

const VendorMyOrdersTable = ({ data = [], loading = false, onViewOrder }) => {
    const columns = [
        { key: 'refId', label: 'Order ID' },
        { key: 'trackingNumber', label: 'Tracking Number' },
        { key: 'orderItemsCount', label: 'Order Items' },
        { key: 'totalAmount', label: 'Price' },
        { 
            key: 'createdAt', 
            label: 'Date',
            render: (value) => dateFormat(value, 'dd-MM-yyyy')
        },
        { key: 'shippingAddress', label: 'Shipping Address' }
    ];

    const actions = [
        {
            label: () => 'View Order',
            onClick: (row) => onViewOrder(row.id)
        }
    ];

    return (
        <div className="w-full">
            {data.length > 0 ? (
                <ReviewTable
                    title="My Orders"
                    columns={columns}
                    data={data}
                    allData={data}
                    exportData={true}
                    isLoading={loading}
                    hasNumber={true}
                    actions={actions}
                    currentPage={1}
                    totalPages={1}
                    onPageChange={null}
                />
            ) : (
                <div className="empty-store bg-white rounded-lg p-8">
                    <div className="text-center">
                        <img
                            src="https://res.cloudinary.com/ddj0k8gdw/image/upload/v1736780988/Shopping_bag-bro_1_vp1yri.png"
                            alt="Empty Store Illustration"
                            className="w-80 h-80 mx-auto"
                        />
                    </div>
                    <h1 className="text-center text-lg font-bold mb-4">
                        No Orders Found!
                    </h1>
                    <div className="text-center text-gray-600 mb-6">
                        <p>You haven't placed any orders yet. Discover our latest products and start shopping!</p>
                    </div>
                    <div className="text-center flex justify-center">
                        <Button 
                            className="bg-kudu-orange text-white px-6 py-2" 
                            onClick={() => window.location.href = '/'}
                        >
                            Start Shopping
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorMyOrdersTable;
