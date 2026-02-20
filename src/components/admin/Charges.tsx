import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/apiFactory";
import { useRef, forwardRef } from "react";
// Add toast import (assume a toast library, e.g. react-hot-toast)
import { toast } from "react-toastify";
import { useState } from "react";

interface Charge {
  id: number;
  name: string;
  description: string;
  charge_currency: string;
  charge_amount: string;
  charge_percentage: string | null;
  calculation_type: string;
  minimum_product_amount: string;
  maximum_product_amount: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface API_RESPONSE {
  status: number;
  data: Charge[];
}

interface ChargesResponse extends API_RESPONSE {}
interface ChargeDialogProps {
  mutation: ReturnType<typeof useMutation>;
  onClose: () => void;
}
const ChargeDialog = forwardRef<HTMLDialogElement, ChargeDialogProps>(
  ({ mutation, onClose }, ref) => {
    // Prevent dialog from closing if mutation is pending
    const handleDialogClick = (
      e: React.MouseEvent<HTMLDialogElement, MouseEvent>,
    ) => {
      // if (mutation.isPending) return null;
      // Fix: compare to dialog element, not ref
      if (e.target === (ref && "current" in ref ? ref.current : null)) {
        onClose();
      }
    };

    // Form submit handler
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (mutation.isPending) return;

      const formData = Object.fromEntries(new FormData(e.currentTarget));
      mutation.mutate(formData as Record<string, any>);
    };

    return (
      <dialog
        ref={ref as React.RefObject<HTMLDialogElement>}
        onClick={handleDialogClick}
        className="rounded-lg shadow-lg max-w-full w-[95vw] sm:w-[400px] md:w-[500px]"
        style={{ maxWidth: "100vw" }}
      >
        <form
          className="p-4 sm:p-6 bg-white flex flex-col gap-4 min-w-[0] w-full"
          onSubmit={handleSubmit}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Create Charge
          </h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input
                type="text"
                name="name"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                required
                disabled={mutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Description
              <input
                type="text"
                name="description"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={mutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Amount
              <input
                type="number"
                name="charge_amount"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={mutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Percentage
              <input
                type="number"
                name="charge_percentage"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                max="100"
                step="any"
                disabled={mutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Currency
              <select
                name="charge_currency"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={mutation.isPending}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select currency
                </option>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Calculation Type
              <select
                name="calculation_type"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={mutation.isPending}
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Minimum Product Amount
              <input
                type="number"
                name="minimum_product_amount"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={mutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Maximum Product Amount
              <input
                type="number"
                name="maximum_product_amount"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={mutation.isPending}
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={() => {
                if (!mutation.isPending) onClose();
              }}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-kudu-orange text-white hover:bg-orange-500 active:scale-95"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </dialog>
    );
  },
);

// Responsive ChargesTable

export default function Charges() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      let resp = await apiClient.post("/admin/product/charges", formData);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Charge created successfully!");
      dialogRef.current?.close();
      queryClient.invalidateQueries({ queryKey: ["charges_admin"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create charge. Please try again.",
      );
    },
  });

  const query = useQuery<ChargesResponse>({
    queryKey: ["charges_admin"],
    queryFn: async () => {
      let resp = await apiClient.get("admin/product/charges");
      return resp.data;
    },
  });

  const handleDialogOpen = () => {
    dialogRef.current?.showModal();
  };

  const handleDialogClose = () => {
    dialogRef.current?.close();
  };

  return (
    <div className="h-full flex flex-col gap-2 rounded-lg w-full max-w-full px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-800">
          Set Product Charge
        </h2>
        <button
          onClick={handleDialogOpen}
          className="py-2 text-white rounded-md bg-kudu-orange hover:bg-kudu-orange px-4 active:scale-95 w-full sm:w-auto"
        >
          Create Charge
        </button>
      </div>
      <div>
        {query?.isFetching ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            {query.data?.data?.length < 1 && (
              <div className="p-2 text-lg  opacity-80">
                No charges create charge
              </div>
            )}
            {query.data?.data?.map((item) => {
              return <ChargeItem key={item.id} charge={item} />;
            })}
          </>
        )}

        {query.isError && <>error occured</>}
      </div>
      <ChargeDialog
        ref={dialogRef}
        mutation={mutation}
        onClose={handleDialogClose}
      />
    </div>
  );
}

const ChargeItem = (props: { charge: Charge }) => {
  const { charge } = props;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isStatusPending, setIsStatusPending] = useState(false);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      await apiClient.delete(`/admin/product/charges/${charge.id}`);
    },
    onSuccess: () => {
      toast.success("Charge deleted successfully!");
      setShowConfirm(false);
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: ["charges_admin"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete charge. Please try again.",
      );
      setIsDeleting(false);
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      await apiClient.put(`/admin/product/charges/${charge.id}`, formData);
    },
    onSuccess: () => {
      toast.success("Charge updated successfully!");
      editDialogRef.current?.close();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["charges_admin"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update charge. Please try again.",
      );
    },
  });

  // Activate/deactivate mutation
  const statusMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      setIsStatusPending(true);
      const endpoint = activate
        ? `/admin/product/charges/${charge.id}/status/activate`
        : `/admin/product/charges/${charge.id}/status/deactivate`;
      await apiClient.patch(endpoint);
    },
    onSuccess: (_data, activate) => {
      toast.success(
        activate
          ? "Charge activated successfully!"
          : "Charge deactivated successfully!",
      );
      setIsStatusPending(false);
      queryClient.invalidateQueries({ queryKey: ["charges_admin"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update charge status. Please try again.",
      );
      setIsStatusPending(false);
    },
  });

  // Open edit dialog
  const handleEditOpen = () => {
    setIsEditing(true);
    editDialogRef.current?.showModal();
  };

  // Close edit dialog
  const handleEditClose = () => {
    setIsEditing(false);
    editDialogRef.current?.close();
  };

  // Edit form submit handler
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editMutation.isPending) return;
    const formData = Object.fromEntries(new FormData(e.currentTarget));
    editMutation.mutate(formData as Record<string, any>);
  };

  // Activate/deactivate handlers
  const handleActivate = () => {
    if (!isStatusPending) {
      statusMutation.mutate(true);
    }
  };
  const handleDeactivate = () => {
    if (!isStatusPending) {
      statusMutation.mutate(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 flex flex-col gap-2 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="font-semibold text-gray-800 text-base">
            {charge.name}
          </div>
          <div className="text-sm text-gray-500">{charge.description}</div>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-sm bg-blue-500 text-white hover:bg-blue-600 active:scale-95 text-sm"
            onClick={handleEditOpen}
            disabled={isDeleting || isStatusPending}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 rounded-sm bg-red-500 text-white hover:bg-red-600 active:scale-95 text-sm"
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting || isStatusPending}
          >
            Delete
          </button>
          {charge.is_active ? (
            <button
              className="px-3 py-1 rounded-sm bg-kudu-orange500 text-white hover:bg-yellow-600 active:scale-95 text-sm"
              onClick={handleDeactivate}
              disabled={isStatusPending || isDeleting}
            >
              {isStatusPending ? "Deactivating..." : "Deactivate"}
            </button>
          ) : (
            <button
              className="px-3 py-1 rounded-sm bg-green-500 text-white hover:bg-green-600 active:scale-95 text-sm"
              onClick={handleActivate}
              disabled={isStatusPending || isDeleting}
            >
              {isStatusPending ? "Activating..." : "Activate"}
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-700 mt-2">
        <div>
          <span className="font-medium">Amount:</span> {charge.charge_amount}
        </div>
        <div>
          <span className="font-medium">Percentage:</span>{" "}
          {charge.charge_percentage ?? "-"}
        </div>
        <div>
          <span className="font-medium">Currency:</span>{" "}
          {charge.charge_currency}
        </div>
        <div>
          <span className="font-medium">Type:</span> {charge.calculation_type}
        </div>
        <div>
          <span className="font-medium">Min Product:</span>{" "}
          {charge.minimum_product_amount}
        </div>
        <div>
          <span className="font-medium">Max Product:</span>{" "}
          {charge.maximum_product_amount}
        </div>
        <div>
          <span className="font-medium">Active:</span>{" "}
          {charge.is_active ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-medium">Updated:</span>{" "}
          {new Date(charge.updatedAt).toLocaleDateString()}
        </div>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-xs flex flex-col gap-4">
            <div className="text-lg font-semibold text-gray-800">
              Confirm Delete
            </div>
            <div className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-bold">{charge.name}</span>? This action
              cannot be undone.
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-4 py-2 rounded-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-sm bg-red-500 text-white hover:bg-red-600 active:scale-95"
                onClick={() => deleteMutation.mutate()}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      <dialog
        ref={editDialogRef}
        className="rounded-lg shadow-lg max-w-full w-[95vw] sm:w-[400px] md:w-[500px]"
        style={{ maxWidth: "100vw" }}
        onClick={(e) => {
          if (e.target === editDialogRef.current && !editMutation.isPending) {
            handleEditClose();
          }
        }}
      >
        <form
          className="p-4 sm:p-6 bg-white flex flex-col gap-4 min-w-[0] w-full"
          onSubmit={handleEditSubmit}
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Edit Charge
          </h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Name
              <input
                type="text"
                name="name"
                defaultValue={charge.name}
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                required
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Description
              <input
                type="text"
                name="description"
                defaultValue={charge.description}
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Amount
              <input
                type="number"
                name="charge_amount"
                defaultValue={charge.charge_amount}
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Percentage
              <input
                type="number"
                name="charge_percentage"
                defaultValue={
                  charge.charge_percentage !== null &&
                  charge.charge_percentage !== ""
                    ? parseFloat(charge.charge_percentage).toFixed(2)
                    : ""
                }
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                max="100"
                step="0.01"
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Charge Currency
              <select
                name="charge_currency"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={editMutation.isPending}
                required
                defaultValue={charge.charge_currency}
              >
                <option value="" disabled>
                  Select currency
                </option>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Calculation Type
              <select
                name="calculation_type"
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                disabled={editMutation.isPending}
                required
                defaultValue={charge.calculation_type}
              >
                <option value="" disabled>
                  Select type
                </option>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Minimum Product Amount
              <input
                type="number"
                name="minimum_product_amount"
                defaultValue={charge.minimum_product_amount}
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Maximum Product Amount
              <input
                type="number"
                name="maximum_product_amount"
                defaultValue={charge.maximum_product_amount}
                className="mt-1 px-3 py-2 border rounded-md w-full focus:outline-hidden focus:ring-2 focus:ring-kudu-orange"
                min="0"
                step="any"
                disabled={editMutation.isPending}
              />
            </label>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Active
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={charge.is_active}
                className="ml-2"
                disabled={editMutation.isPending}
                value="true"
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={handleEditClose}
              disabled={editMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-kudu-orange text-white hover:bg-orange-500 active:scale-95"
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};
