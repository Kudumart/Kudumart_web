import React, { useState, useMemo } from 'react';
import { dateFormat } from '../helpers/dateHelper';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../hooks/modal';
import { useDebounce } from '../hooks/useDebounce';
import DeleteModal from './DeleteModal';
import Table from './ReviewTable';

const ProductCategoriesTable = ({ data, refetch, loading }) => {
    const navigate = useNavigate();
    const { openModal } = useModal();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const handleRedirect = () => {
        refetch();
    };

    const handleDeleteModal = (id) => {
        openModal({
            size: "sm",
            content: <DeleteModal title={'Do you wish to delete this category?'} redirect={handleRedirect}
                api={`/admin/categories?categoryId=${id}`} />
        })
    };

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!data) return [];
        
        if (!debouncedSearchQuery.trim()) {
            return data;
        }

        const query = debouncedSearchQuery.toLowerCase();
        return data.filter(item => 
            item?.name?.toLowerCase().includes(query)
        );
    }, [data, debouncedSearchQuery]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset to page 1 when search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    // Safe date formatting for export
    const exportData = paginatedData?.map(item => ({
        "Category Name": item.name || "",
        "Date Added": dateFormat(item.createdAt, "dd-MM-yyyy")
    }));

    return (
        <>
            <div className='All'>
                <div className="rounded-md pb-2 w-full flex justify-between gap-5">
                    <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">Products Categories</h2>
                    <span className="text-white flex items-start h-auto">
                        <span className="mr-1 text-sm bg-kudu-orange py-2 px-4 cursor-pointer rounded-lg font-medium" onClick={() => navigate('add-category')}>
                            Add Product Category
                        </span>
                    </span>
                </div>
                <div className="bg-white rounded-md p-6 w-full gap-5">
                    <Table
                        title="Products Categories"
                        columns={[
                            { key: 'name', label: 'Category Name' },
                            { 
                                key: 'image', 
                                label: 'Category Icon',
                                render: (value) => value ? <img src={value} width={50} height={50} alt="Category" /> : 'No Image'
                            },
                            { 
                                key: 'createdAt', 
                                label: 'Date Added',
                                render: (value) => dateFormat(value, "dd-MM-yyyy")
                            },
                        ]}
                        exportData={exportData}
                        hasNumber
                        isLoading={loading}
                        disableInternalSearch={true}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        searchPlaceholder="Search categories..."
                        data={paginatedData}
                        actions={[
                            {
                                label: () => 'Create SubCategories',
                                onClick: (row) => navigate(`sub-category/create/${row.id}`),
                            },
                            {
                                label: () => 'Edit',
                                onClick: (row) => navigate(`edit/${row.id}`),
                            },
                            {
                                label: () => 'Delete',
                                onClick: (row) => handleDeleteModal(row.id),
                            },
                        ]}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        totalItems={filteredData.length}
                    />
                </div>
            </div>
        </>
    );
};

export default ProductCategoriesTable;
