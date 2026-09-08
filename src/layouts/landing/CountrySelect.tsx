import { useEffect, useState } from "react";
import { useCountrySelect } from "../../store/clientStore";
import { useQueryClient } from "@tanstack/react-query";

export default function CountrySelect() {
  const { countries, setCountry, country } = useCountrySelect();

  // Helper to safely get active country details
  const activeCountry = countries.find(
    (c) => c.value?.toLowerCase() === country?.value?.toLowerCase() || c.label === country?.label
  ) || countries[0];

  return (
    <div className="w-fit flex items-center mx-2" data-theme="kudu">
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn btn-sm btn-outline border-gray-300 hover:border-[#D97706] hover:bg-amber-50 hover:text-gray-800 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer bg-white text-gray-700 shadow-sm transition-all"
        >
          <span className="text-sm">{activeCountry.flag}</span>
          <span className="font-bold">{activeCountry.currency}</span>
          <span className="text-gray-400 font-normal">({activeCountry.symbol})</span>
          <svg className="w-3 h-3 ml-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-1.5 shadow-xl bg-white rounded-xl w-60 border border-gray-200 mt-2 z-50 text-xs"
        >
          <li className="menu-title px-3 py-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Select Currency & Country
          </li>
          {countries.map((c) => {
            const isSelected = c.value === activeCountry.value;
            return (
              <li key={c.value}>
                <button
                  type="button"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-amber-50 text-[#D97706] font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setCountry(c);
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px] font-semibold">
                    {c.symbol} {c.currency}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
