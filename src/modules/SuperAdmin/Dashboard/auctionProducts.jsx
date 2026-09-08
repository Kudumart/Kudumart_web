import React, { useEffect, useState } from 'react';
import useApiMutation from '../../../api/hooks/useApiMutation';
import Loader from '../../../components/Loader';
import MyProducts from '../../../components/MyProducts';
import Table from '../../../components/ReviewTable';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../../../components/Modal';
import { useModal } from '../../../hooks/modal';

const AuctionProducts = () => {
    const { mutate } = useApiMutation();
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [selectedCountry, setSelectedCountry] = useState("");

    const navigate = useNavigate();

    const { openModal } = useModal();

    const countries = [
        { label: "All Locations", value: "" },
        { label: "Nigeria 🇳🇬", value: "Nigeria" },
        { label: "United States 🇺🇸", value: "United States" },
        { label: "United Kingdom 🇬🇧", value: "United Kingdom" },
    ];

    // Fetch both products and categories and merge them
    const fetchData = async (page, countryFilter = selectedCountry) => {
        setLoading(true)
        try {
            const countryQuery = countryFilter ? `&country=${encodeURIComponent(countryFilter)}` : "";

            const auctionProductRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/auction/products?page=${page}${countryQuery}`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data || []),
                    onError: reject,
                });
            });


            const totalAuctionProductRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/auction/products?page=1&limit=100000000${countryQuery}`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data || []),
                    onError: reject,
                });
            });


            const categoryRequest = new Promise((resolve, reject) => {
                mutate({
                    url: '/admin/categories',
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data.data),
                    onError: reject,
                });
            });

            const [productsData, totalProductData, categories] = await Promise.all([
                auctionProductRequest,
                totalAuctionProductRequest,
                categoryRequest,
            ]);

            // Merge categories with products
            const mergedData = (productsData.data || []).map((product) => {
                const category = categories.find(
                    (cat) => cat.id === product.sub_category?.categoryId
                );
                return {
                    ...product,
                    category: category ? category.name : 'Unknown',
                };
            });


            const mergedNewData = (totalProductData.data || []).map((product) => {
                const category = categories.find(
                    (cat) => cat.id === product.sub_category?.categoryId
                );
                return {
                    ...product,
                    category: category ? category.name : 'Unknown',
                };
            });


            setProducts(mergedData);
            setTotalProducts(mergedNewData);
            setPagination(productsData.pagination || {});
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, [selectedCountry]);

    const handleCountryChange = (countryVal) => {
        setSelectedCountry(countryVal);
        fetchData(1, countryVal);
    };

    const handleEdit = (product) => {
        navigate(`edit/${product.id}`);
    };

    const handleDeleteModal = (product) => {
        openModal({
            size: "sm",
            content: (
                <Modal
                    title={`Are you sure you want to permanently delete auction "${product.name}"? This action cannot be undone.`}
                    redirect={() => fetchData(pagination.page || 1)}
                    api={`/admin/general/auction/product/delete?auctionProductId=${product.id}`}
                    method={"DELETE"}
                />
            )
        });
    };

    const handleStatusModal = (product) => {
        const isCancelled = product.auctionStatus === "cancelled";
        const actionLabel = isCancelled ? "Reactivate / Approve" : "Cancel";
        const nextStatus = isCancelled ? "ongoing" : "cancelled";

        openModal({
            size: "sm",
            content: (
                <Modal
                    title={`Do you wish to ${actionLabel.toLowerCase()} this auction product "${product.name}"?`}
                    redirect={() => fetchData(pagination.page || 1)}
                    api={`/admin/general/auction/product/status?auctionProductId=${product.id}&status=${nextStatus}`}
                    method={"PUT"}
                />
            )
        });
    };

    return (
        <div className="min-h-screen">
            <div className='All'>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">Auction Products</h2>
                    <Link
                        to="new-product"
                        className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 text-center inline-block"
                    >
                        Create New Auction Product
                    </Link>
                </div>

                {/* Country Filter Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {countries.map((c) => (
                        <button
                            key={c.value}
                            onClick={() => handleCountryChange(c.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedCountry === c.value
                                    ? "bg-orange-500 text-white shadow-sm"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <h2 className="text-lg font-semibold text-black-700">Auction Products</h2>
                    <div className="overflow-x-auto">
                        <Table
                            columns={[
                                { key: 'name', label: 'Products' },
                                { key: 'sku', label: 'Product ID' },
                                { key: 'category', label: 'Category' },
                                { key: 'country', label: 'Location' },
                                { key: 'vendor', label: 'Vendor' },
                                { key: 'price', label: 'Price' },
                                {
                                    key: 'auctionStatus',
                                    label: 'Status',
                                    render: (value) => (
                                        <span className={`py-1 px-3 rounded-full text-sm capitalize ${
                                            value === 'ongoing'
                                                ? 'bg-green-100 text-green-700 font-semibold'
                                                : value === 'upcoming'
                                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                                : value === 'cancelled'
                                                ? 'bg-yellow-100 text-yellow-800 font-semibold'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {value}
                                        </span>
                                    )
                                },
                            ]}
                            exportData
                            isLoading={loading}
                            allData={totalProducts.map((item) => ({
                                ...item,
                                country: item.store?.location?.country || item.store?.location?.[0]?.country || "N/A",
                                price: `${item.store?.currency?.symbol || "₦"} ${item.price}`,
                                vendor: item.admin ? `Administrator` : `${item.vendor?.firstName || ""} ${item.vendor?.lastName || ""}`.trim() || "Vendor"
                            }))}
                            data={products.map((item) => ({
                                ...item,
                                country: item.store?.location?.country || item.store?.location?.[0]?.country || "N/A",
                                price: `${item.store?.currency?.symbol || "₦"} ${item.price}`,
                                vendor: item.admin ? `Administrator` : `${item.vendor?.firstName || ""} ${item.vendor?.lastName || ""}`.trim() || "Vendor"
                            }))}
                            actions={[
                                {
                                    label: () => "Edit",
                                    onClick: (row) => handleEdit(row),
                                },
                                {
                                    label: (row) => row.auctionStatus === "cancelled" ? "Approve" : "Cancel",
                                    onClick: (row) => handleStatusModal(row),
                                },
                                {
                                    label: () => "Delete",
                                    onClick: (row) => handleDeleteModal(row),
                                },
                            ]}
                            currentPage={pagination.page}
                            totalPages={pagination.pages}
                            onPageChange={(page) => fetchData(page)}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionProducts;
