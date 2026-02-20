import React, { useState, useMemo } from 'react';
import { dateFormat } from '../helpers/dateHelper';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../hooks/modal';
import { useDebounce } from '../hooks/useDebounce';
import DeleteModal from './DeleteModal';
import Table from './ReviewTable';

const ProductSubCategoriesTable = ({ data, refetch, loading }) => {
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
            content: <DeleteModal title={'Do you wish to delete this sub category?'} redirect={handleRedirect}
                api={`/admin/sub/categories?subCategoryId=${id}`} />
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
            item?.name?.toLowerCase().includes(query) ||
            item?.categoryName?.toLowerCase().includes(query)
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

    const columns = [
        { key: 'name', label: 'Sub Category Name' },
        { 
            key: 'image', 
            label: 'Sub Category Icon', 
            render: (value) => value ? (
                <img src={value} width={50} height={50} alt="Sub Category Icon" className="rounded" />
            ) : 'No Image'
        },
        { key: 'categoryName', label: 'Category Name' },
        { 
            key: 'createdAt', 
            label: 'Date Added', 
            render: (value) => dateFormat(value, "dd-MM-yyyy")
        }
    ];

    const actions = [
        {
            label: () => "Update",
            onClick: (row) => navigate(`update/${row.id}`)
        },
        {
            label: () => "Delete",
            onClick: (row) => handleDeleteModal(row.id)
        }
    ];

    // Safe export data formatting
    const exportData = paginatedData?.map(item => ({
        "Sub Category Name": item.name || "",
        "Category Name": item.categoryName || "",
        "Date Added": dateFormat(item.createdAt, "dd-MM-yyyy")
    }));

    return (
        <>
            <div className='All'>
                <div className="rounded-md pb-2 w-full flex justify-between gap-5">
                    <h2 className="text-lg font-semibold text-black-700 mb-4 mt-4">Product Sub Categories</h2>
                </div>
                <div className="bg-white rounded-md w-full gap-5">
                    <Table
                        title="Product Sub Categories"
                        columns={columns}
                        data={paginatedData || []}
                        exportData={exportData}
                        isLoading={loading}
                        hasNumber={true}
                        disableInternalSearch={true}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        searchPlaceholder="Search sub categories..."
                        actions={actions}
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

export default ProductSubCategoriesTable;
