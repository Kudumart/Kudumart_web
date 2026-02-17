import { useState } from "react";
import { useSelector } from "react-redux";

const useAppState = () => {
  const state = useSelector((state) => state);

  return {
    user: state.user?.data,
    currency: state.user?.currencies,
    ipInfo: state.user?.ipInfo,
    // products: state.products?.data,
  };
};

export default useAppState;
export const usePagination = ({ initialLimit } = {}) => {
  const [params, setParams] = useState({ page: 1, limit: initialLimit || 10 });

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const nextPage = (total) => {
    if (total == params.limit) {
      handlePageChange(params.page + 1);

      return console.log(total, params.limit);
    }
  };

  const prevPage = () => {
    if (params.page > 1) {
      handlePageChange(params.page - 1);
    }
  };

  const handleLimitChange = (limit) => {
    setParams((prev) => ({ ...prev, limit }));
  };

  return { params, handlePageChange, handleLimitChange, nextPage, prevPage };
};

export const useSmallPagination = ({ initialLimit } = {}) => {
  const [params, setParams] = useState({ page: 1, limit: initialLimit || 5 });

  const handlePageChange = (page) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const nextPage = (total) => {
    setParams((prev) => ({ ...prev, page: prev.page + 1 }));
    // if (total == params.limit) {
    // handlePageChange(params.page + 1);
    // return console.log(total, params.limit);
    // if (params.page = Math.ceil(total / params.limit)) {
    // }
  };

  const prevPage = () => {
    if (params.page > 1) {
      handlePageChange(params.page - 1);
    }
  };

  const handleLimitChange = (limit) => {
    setParams((prev) => ({ ...prev, limit }));
  };

  return { params, handlePageChange, handleLimitChange, nextPage, prevPage };
};
