import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllStoreQuery,
  useGetCategoriesQuery,
  useDeleteProductMutation,
} from "../../../reducers/storeSlice";
import ProductTypeModal from "./ProductTypeModal";
import { toast } from "react-toastify";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import VendorMyProductsTable from "../../../components/VendorMyProductsTable";
import Modal from "../../../components/modals/DialogModal";
import { useNewModal } from "../../../components/modals/modals";

const MyProducts = () => {
  const productOptionModal = useNewModal();
  const deleteModal = useNewModal();

  const [productId, setProductId] = useState(null);
  const [mergedProducts, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { mutate } = useApiMutation();
  const navigate = useNavigate();

  const { data: stores } = useGetAllStoreQuery({
    refetchOnMountOrArgChange: true,
  });
  const { data: categories } = useGetCategoriesQuery({
    refetchOnMountOrArgChange: true,
  });
  const [deleteProd] = useDeleteProductMutation();

  const handleOpenModal = () => {
    if (stores) {
      productOptionModal.showModal();
    } else {
      toast.error("No stores found for this vendor");
    }
  };

  const openAddNewProductForm = () => {
    navigate("/profile/products/create");
    productOptionModal.closeModal();
  };

  const openAddNewAuctionProductForm = () => {
    navigate("/profile/auction-products/create");
    productOptionModal.closeModal();
  };

  const openDelModal = (id) => {
    setProductId(id);
    deleteModal.showModal();
  };

  const deleteProduct = () => {
    deleteProd(productId)
      .then((res) => {
        toast.success(res.data.message);
        getMyProducts();
      })
      .catch((err) => {
        console.error(err);
      });
    deleteModal.closeModal();
  };

  const handleEdit = (product) => {
    if (product.auctionStatus === "ongoing") {
      toast.error("Editing ongoing auction products is not permitted.");
      return;
    }
    navigate(
      product.auctionStatus
        ? `/profile/auction-products/edit/${product.id}`
        : `edit/${product.id}`,
    );
  };

  const getMyProducts = () => {
    mutate({
      url: `/vendor/vendors/products`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        getAuctionProducts(response.data.data);
      },
      onError: (error) => {
        if (
          error.response?.status === 404 ||
          error.message?.includes("No products found")
        ) {
          getAuctionProducts([]);
        } else {
          setProducts([]);
          setLoading(false);
        }
      },
    });
  };

  const getAuctionProducts = (data) => {
    mutate({
      url: `/vendor/auction/products`,
      method: "GET",
      headers: true,
      hideToast: true,
      onSuccess: (response) => {
        const merged = [...(data || []), ...response.data.data];
        setProducts(merged);
        setLoading(false);
      },
      onError: (error) => {
        if (
          error.response?.status === 404 ||
          error.message?.includes("No auction products found")
        ) {
          setProducts(data || []);
        } else {
          setProducts(data || []);
        }
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    getMyProducts();
  }, []);

  return (
    <>
      {loading ? (
        <div className="w-full h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <VendorMyProductsTable
          data={mergedProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={openDelModal}
          onCreateProduct={handleOpenModal}
          hasStores={!!stores}
        />
      )}

      {/* Product Type Selection Modal */}
      <Modal ref={productOptionModal.ref} title="Select Product Type">
        <ProductTypeModal
          openAddNewAuctionProductForm={openAddNewAuctionProductForm}
          openAddNewProductForm={openAddNewProductForm}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        ref={deleteModal.ref}
        title="Confirm Delete"
        actions={
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm bg-kudu-dark-grey text-white"
              onClick={() => deleteModal.closeModal()}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm bg-kudu-orange text-white border-none"
              onClick={deleteProduct}
            >
              Delete Product
            </button>
          </div>
        }
      >
        <p className="text-center py-4">
          Are you sure you want to delete this product?
        </p>
      </Modal>
    </>
  );
};

export default MyProducts;
