import React, { useEffect, useRef, useState } from 'react';
import PostProducts from '../../../components/PostProducts';
import useApiMutation from '../../../api/hooks/useApiMutation';
import { useDebounce } from '../../../hooks/useDebounce';

const App = () => {
  const { mutate } = useApiMutation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const requestSequence = useRef(0);

  // Fetch one server-filtered page at a time so the admin stays responsive.
  const fetchData = async (page, search = debouncedSearch) => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    try {
      const productRequest = new Promise((resolve, reject) => {
        mutate({
          url: `/admin/general/products?page=${page}&limit=20${search ? `&name=${encodeURIComponent(search)}` : ''}`,
          method: 'GET',
          headers: true,
          hideToast: true,
          onSuccess: (response) => resolve(response.data),
          onError: reject,
        });
      });


      const productsData = await productRequest;
      if (requestId !== requestSequence.current) return;
      const mergedData = productsData.data.map((product) => {
        return {
          ...product,
          category: product.sub_category?.name || 'Unknown',
        };
      });
      setProducts(mergedData);
      setPagination(productsData.pagination);
    } catch (error) {
      if (requestId !== requestSequence.current) return;
      console.error('Error fetching data:', error);
      setProducts([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen">
      <PostProducts data={products} loading={loading} paginate={pagination} refetch={(page) => fetchData(page, debouncedSearch)} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </div>
  );
};

export default App;
