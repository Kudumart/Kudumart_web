import React, { useEffect, useState } from "react";
import useApiMutation from "../../../../api/hooks/useApiMutation";
import Loader from "../../../../components/Loader";
import { useGetFaqs } from "../../../../api/pages/faqs";
import FaqCategories from "../../../../components/inner-pages/faqs-category/FaqCategories";
import Faqs from "../../../../components/inner-pages/faqs/Faqs";

const App = () => {

  const { data:faqs, isLoading, refetch } = useGetFaqs();

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <Faqs data={faqs} refetch={() => refetch()} loading={isLoading} />
      )}
    </div>
  );
};

export default App;
