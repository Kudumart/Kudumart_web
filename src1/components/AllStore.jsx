import React from 'react';
import { dateFormat } from '../helpers/dateHelper';
import Table from './ReviewTable';

const AllStore = ({ data, paginate, totalData, loading, refetch }) => {

    const fetchNew = (page) => {
        refetch(page)
    }


    return (
        <>
            <div className='All'>
                <div className="rounded-md pb-2 w-full gap-5"><h2 className="text-lg font-semibold text-black-700 mb-4">All Stores</h2></div>
                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <h2 className="text-lg font-semibold text-black-700">All Stores</h2>
                    <div className="overflow-x-auto">
                        <Table
                            columns={[
                                { key: 'name', label: 'Store Name' },
                                { key: 'vendor', label: 'Vendor Name' },
                                {
                                    key: 'totalProducts', label: 'No. Product'
                                },
                                { key: 'createdAt', label: 'Date Created' },
                            ]}
                            exportData
                            isLoading={loading}
                            allData={totalData.map((item) => ({
                                ...item,
                                vendor: item.vendor ? `${item.vendor.firstName} ${item.vendor.lastName}` : 'Administrator',
                                createdAt: `${dateFormat(item.createdAt, "dd-MM-YYY")}`,
                            }))
                            }
                            data={data.map((item) => ({
                                ...item,
                                vendor: item.vendor ? `${item.vendor.firstName} ${item.vendor.lastName}` : 'Administrator',
                                createdAt: `${dateFormat(item.createdAt, "dd-MM-YYY")}`,
                            }))
                            }
                            actions={[]}
                            currentPage={paginate.page}
                            totalPages={paginate.pages}
                            onPageChange={(page) => fetchNew(page)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AllStore;
