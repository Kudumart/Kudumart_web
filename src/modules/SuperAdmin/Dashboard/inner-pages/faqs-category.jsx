import React, { useEffect, useState } from "react";
import useApiMutation from "../../../../api/hooks/useApiMutation";
import Loader from "../../../../components/Loader";
import { useGetFaqsCategory } from "../../../../api/pages/faqs";
import FaqCategories from "../../../../components/inner-pages/faqs-category/FaqCategories";

const App = () => {
  const { data: faqCategories, isLoading, refetch } = useGetFaqsCategory();

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <FaqCategories data={faqCategories} refetch={() => refetch()} />
      )}
    </div>
  );
};

export default App;
