import React from "react";
import Loader from "../../../../components/Loader";
import { useGetFaqs } from "../../../../api/pages/faqs";
import Testimonials from "../../../../components/inner-pages/testimonials/Testimonials";
import { useGetAdminTestimonials } from "../../../../api/pages/testimonials";

const App = () => {

  const { data:testimonails, isLoading, refetch } = useGetAdminTestimonials();

  return (
    <div className="min-h-screen">
      {isLoading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <Testimonials data={testimonails} refetch={() => refetch()} loading={isLoading} />
      )}
    </div>
  );
};

export default App;
