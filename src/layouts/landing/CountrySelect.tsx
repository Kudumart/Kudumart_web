import { useEffect, useState } from "react";
import { useCountrySelect } from "../../store/clientStore";
import { useQueryClient } from "@tanstack/react-query";

export default function CountrySelect() {
  // const [selectedCountry, setSelectedCountry] = useState<string | null>("NGA");
  const queryCliet = useQueryClient();
  const { countries, setCountry, country } = useCountrySelect();

  return (
    <div className="w-fit flex  mx-2 " data-theme="kudu">
      {country && (
        <label className="label mr-2 hidden md:flex">
          <span className="label-text">Location:</span>
        </label>
      )}
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn  btn-bordered justify-start size-auto p-2"
        >
          {country ? country.label : "Pick your location"}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          {countries
            .filter((item) => item.value !== country.value)
            .map((c) => (
              <li key={c.value}>
                <a
                  onClick={() => {
                    setCountry(c);
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                >
                  {c.label}
                </a>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
