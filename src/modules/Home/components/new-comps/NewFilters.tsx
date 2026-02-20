import { useNewFilters } from "../../../../hooks/new_hooks";
import { useState } from "react";

export default function NewFilters() {
  const { filters, setMin, setMax, clearFilters } = useNewFilters();
  const [internalMin, setInternalMin] = useState(filters.minPrice);
  const [internalMax, setInternalMax] = useState(filters.maxPrice);

  const applyFilters = () => {
    setMin(internalMin);
    setMax(internalMax);
  };

  const handleMinChange = (value: number) => {
    if (value < internalMax) {
      setInternalMin(value);
    } else {
      setInternalMin(internalMax);
    }
  };

  const handleMaxChange = (value: number) => {
    if (value > internalMin) {
      setInternalMax(value);
    } else {
      setInternalMax(internalMin);
    }
  };

  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-lg" data-theme="kudu">
      <div className="form-control">
        <label className="label mb-4">
          <span className="label-text text-xl font-semibold">Price Range</span>
        </label>
        <div className="flex space-x-6">
          <div className="flex flex-col w-1/2">
            <label className="label">
              <span className="label-text">Min Price</span>
            </label>
            <input
              type="number"
              min="0"
              max="5000000"
              value={internalMin}
              className="input input-bordered w-full"
              onChange={(e) => handleMinChange(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label className="label">
              <span className="label-text">Max Price</span>
            </label>
            <input
              type="number"
              min="0"
              max="5000000"
              value={internalMax}
              className="input input-bordered w-full"
              onChange={(e) => handleMaxChange(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="label mb-4">
            <span className="label-text text-xl font-semibold  ">
              Adjust Range
            </span>
          </label>
          <div className="flex flex-col space-y-4">
            <div className="form-control">
              <div className="w-full flex justify-between text-lg mt-2 fieldset-label ">
                <span>Min Price: {internalMin}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                value={internalMin}
                className="range range-primary"
                onChange={(e) => handleMinChange(Number(e.target.value))}
              />
            </div>
            <div className="form-control">
              <div className="w-full flex justify-between text-lg mt-2 fieldset-label ">
                <span>Max Price: {internalMax}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                value={internalMax}
                className="range range-primary"
                onChange={(e) => handleMaxChange(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6 space-x-4">
        <button
          className="btn btn-secondary flex-1"
          onClick={() => {
            clearFilters();
            setInternalMin(filters.minPrice);
            setInternalMax(filters.maxPrice);
          }}
        >
          Clear
        </button>
        <button className="btn btn-primary flex-1" onClick={applyFilters}>
          Apply
        </button>
      </div>
    </div>
  );
}
