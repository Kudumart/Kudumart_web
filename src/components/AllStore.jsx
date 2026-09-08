import React from 'react';
import { dateFormat } from '../helpers/dateHelper';
import Table from './ReviewTable';

const AllStore = ({ data, paginate, totalData, loading, refetch, selectedCountry, onCountryChange }) => {

    const fetchNew = (page) => {
        refetch(page)
    }

    const countryTabs = [
        { label: "All Stores", value: "" },
        { label: "🇳🇬 Nigeria", value: "Nigeria" },
        { label: "🇺🇸 United States", value: "United States" },
        { label: "🇬🇧 United Kingdom", value: "United Kingdom" },
    ];

    const getCountryName = (item) => {
        if (!item?.location) return 'Global';
        try {
            const loc = typeof item.location === 'string' ? JSON.parse(item.location) : item.location;
            if (Array.isArray(loc) && loc.length > 0) return loc[0].country || 'Global';
            return loc.country || 'Global';
        } catch (_) {
            return 'Global';
        }
    };

    const getCurrencyDisplay = (item) => {
        if (item?.currency?.symbol || item?.currency?.name) {
            return `${item.currency.symbol || ''} ${item.currency.name || ''}`.trim();
        }
        const country = getCountryName(item);
        if (country.toLowerCase().includes('nigeria')) return '₦ NGN';
        if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa') || country.toLowerCase().includes('us')) return '$ USD';
        if (country.toLowerCase().includes('united kingdom') || country.toLowerCase().includes('uk')) return '£ GBP';
        return '-';
    };

    return (
        <>
            <div className='All'>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Stores Management</h2>
                    {onCountryChange && (
                        <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                            {countryTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => onCountryChange(tab.value)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                        selectedCountry === tab.value
                                            ? "bg-[#D97706] text-white shadow-sm"
                                            : "text-gray-600 hover:bg-white hover:text-gray-900"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-black-700">
                            {selectedCountry ? `${selectedCountry} Stores` : "All Stores"}
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <Table
                            columns={[
                                { key: 'name', label: 'Store Name' },
                                { key: 'vendor', label: 'Vendor Name' },
                                { key: 'country', label: 'Country' },
                                { key: 'currency', label: 'Currency' },
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
                                country: getCountryName(item),
                                currency: getCurrencyDisplay(item),
                                createdAt: `${dateFormat(item.createdAt, "dd-MM-YYY")}`,
                            }))
                            }
                            data={data.map((item) => ({
                                ...item,
                                vendor: item.vendor ? `${item.vendor.firstName} ${item.vendor.lastName}` : 'Administrator',
                                country: getCountryName(item),
                                currency: getCurrencyDisplay(item),
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
