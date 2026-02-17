import React from 'react';
import { dateFormat } from '../helpers/dateHelper';
import Table from './ReviewTable';

const Transaction = ({ data, paginate, totalData, loading, fetchNew }) => {
    return (
        <>
            <div className='All'>
                <div className="rounded-md pb-2 w-full gap-5"><h2 className="text-lg font-semibold text-black-700 mb-4">Transactions</h2></div>
                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <h2 className="text-lg font-semibold text-black-700 mb-4">All Transactions</h2>
                    <div className="overflow-x-auto mt-5">

                    <Table
                        columns={[
                            { key: 'refId', label: 'Transaction ID' },
                            {key: 'user', label: 'User'},
                            { key: 'transactionType', label: 'Transaction Type' },
                            { key: 'amount', label: 'Price' },
                            { key: 'createdAt', label: 'Date', render: (value) => (
                                <span>
                                    {dateFormat(value, 'dd-MM-yyyy')}
                                </span>
                            ) },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (value) => (
                                    <span className={`py-1 px-3 rounded-full text-sm capitalize ${value === 'success'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                        }`}>
                                        {value}
                                    </span>
                                )
                            },
                        ]}
                        exportData
                        isLoading={loading}
                        allData={totalData?.map((item) => ({
                            ...item,
                            user: `${item.user.firstName} ${item.user.lastName}`
                        }))}
                        data={data?.map((item) => ({
                            ...item,
                            user: `${item.user.firstName} ${item.user.lastName}`
                        }))}
                        actions={[]}
                        currentPage={paginate?.page}
                        totalPages={paginate?.pages}
                        onPageChange={(page) => fetchNew(page)}
                    />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Transaction;
