import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetAllStoreQuery,
  useGetCategoriesQuery,
  useDeleteProductMutation,
  useDeleteAuctionProductMutation,
} from "../../../reducers/storeSlice";
import ProductTypeModal from "./ProductTypeModal";
import AIProductCreator from "./AIProductCreator";
import { toast } from "react-toastify";
import useApiMutation from "../../../api/hooks/useApiMutation";
import Loader from "../../../components/Loader";
import VendorMyProductsTable from "../../../components/VendorMyProductsTable";
import Modal from "../../../components/modals/DialogModal";
import { useNewModal } from "../../../components/modals/modals";
import Button from "../../../components/Button";

const MyProducts = () => {
  const productOptionModal = useNewModal();
  const deleteModal = useNewModal();
  const aiModal = useNewModal();

  const [productId, setProductId] = useState(null);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState(null);
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
  const [deleteAuctionProd] = useDeleteAuctionProductMutation();

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

  const openDelModal = (param) => {
    let targetProd = null;
    if (typeof param === "object" && param !== null) {
      targetProd = param;
    } else {
      targetProd = mergedProducts.find((p) => p.id === param);
    }
    setSelectedProductToDelete(targetProd || null);
    setProductId(typeof param === "object" ? param.id : param);
    deleteModal.showModal();
  };

  const deleteProduct = async () => {
    const targetId = selectedProductToDelete?.id || productId;
    if (!targetId) return;

    const isAuction =
      selectedProductToDelete?.auctionStatus != null ||
      selectedProductToDelete?.isAuction === true ||
      selectedProductToDelete?.type === "Auction";

    if (
      isAuction &&
      selectedProductToDelete?.auctionStatus &&
      selectedProductToDelete.auctionStatus === "ended"
    ) {
      toast.error(
        `Cannot delete ended auction. Ended auctions cannot be deleted.`,
      );
      deleteModal.closeModal();
      return;
    }

    try {
      let res;
      if (isAuction) {
        try {
          res = await deleteAuctionProd(targetId).unwrap();
        } catch (aucErr) {
          if (
            aucErr?.status === 404 ||
            aucErr?.data?.message?.includes("not found")
          ) {
            res = await deleteProd(targetId).unwrap();
          } else {
            throw aucErr;
          }
        }
      } else {
        try {
          res = await deleteProd(targetId).unwrap();
        } catch (prodErr) {
          if (
            prodErr?.status === 404 ||
            prodErr?.data?.message?.includes("not found") ||
            prodErr?.data?.message?.includes("Product not found")
          ) {
            res = await deleteAuctionProd(targetId).unwrap();
          } else {
            throw prodErr;
          }
        }
      }
      toast.success(res?.message || "Product deleted successfully");
      getMyProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(
        err?.data?.message || err?.message || "Failed to delete product",
      );
    } finally {
      deleteModal.closeModal();
    }
  };

  const handleEdit = (product) => {
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
          onCreateAIProduct={() => aiModal.showModal()}
          hasStores={!!stores}
        />
      )}

      {/* AI Product Creator Modal */}
      <Modal ref={aiModal.ref} title="Create Product with AI">
        <AIProductCreator onClose={() => aiModal.closeModal()} />
      </Modal>

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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => deleteModal.closeModal()}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={deleteProduct}
            >
              Delete Product
            </Button>
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
