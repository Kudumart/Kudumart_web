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

    const navigate = useNavigate();

    const { openModal } = useModal();

    // Fetch both products and categories and merge them
    const fetchData = async (page) => {
        setLoading(true)
        try {
            const auctionProductRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/auction/products?page=${page}`,
                    method: 'GET',
                    headers: true,
                    hideToast: true,
                    onSuccess: (response) => resolve(response.data || []),
                    onError: reject,
                });
            });


            const totalAuctionProductRequest = new Promise((resolve, reject) => {
                mutate({
                    url: `/admin/general/auction/products?page=1&limit=100000000`,
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
            const mergedData = productsData.data.map((product) => {
                const category = categories.find(
                    (cat) => cat.id === product.sub_category?.categoryId
                );
                return {
                    ...product,
                    category: category ? category.name : 'Unknown',
                };
            });


            const mergedNewData = totalProductData.data.map((product) => {
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
            setPagination(productsData.pagination);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []); // Only run once on mount


    const handleEdit = (product) => {
        if (!product.admin) {
            openModal({
                size: "md",
                content: <Modal title={`You can only edit products uploaded by the Admin`} submitButton={false} />
            })
        }
        else {
            if (product.auctionStatus === 'ongoing') {
                openModal({
                    size: "sm",
                    content: <Modal title={`Editing ongoing auction products is not permitted.`} submitButton={false} />
                })
                return;
            }
            navigate(`edit/${product.id}`)
        }
    }



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
                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <h2 className="text-lg font-semibold text-black-700">Auction Products</h2>
                    <div className="overflow-x-auto">
                        <Table
                            columns={[
                                { key: 'name', label: 'Products' },
                                { key: 'sku', label: 'Product ID' },
                                { key: 'category', label: 'Category' },
                                { key: 'vendor', label: 'Vendor' },
                                { key: 'price', label: 'Price' },
                                {
                                    key: 'auctionStatus',
                                    label: 'Status',
                                    render: (value) => (
                                        <span className={`py-1 px-3 rounded-full text-sm capitalize ${value === 'ongoing'
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
                            allData={totalProducts.map((item) => ({
                                ...item,
                                price: `${item.store.currency.symbol} ${item.price}`,
                                vendor: item.admin ? `Administrator` : `${item.vendor.firstName} ${item.vendor.lastName}`
                            }))
                            }
                            data={products.map((item) => ({
                                ...item,
                                price: `${item.store.currency.symbol} ${item.price}`,
                                vendor: item.admin ? `Administrator` : `${item.vendor.firstName} ${item.vendor.lastName}`
                            }))}
                            /* actions={[
                                 {
                                     label: (row) => {
                                         return `${row.status === 'inactive' ? `Publish` : `Unpublish`}`;
                                     },
                                     onClick: (row) => handlePublishModal(row),
                                 },
                             ]} */
                            actions={[
                                {
                                    label: () => "Edit",
                                    onClick: (row) => handleEdit(row),
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
