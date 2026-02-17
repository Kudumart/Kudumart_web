// components/CustomSelect.js
import React, { useState, useRef } from 'react';

export default function SelectInput({ options, onSelect, placeholder = "Select an option" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const selectRef = useRef(null);

    // Handle dropdown open/close
    const toggleDropdown = () => setIsOpen(!isOpen);

    // Handle option selection
    const handleOptionClick = (option) => {
        setSelectedOption(option);
        onSelect(option);
        setIsOpen(false);
    };

    // Close dropdown if clicked outside
    const handleClickOutside = (e) => {
        if (selectRef.current && !selectRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    // Add event listener for outside clicks
    React.useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full" ref={selectRef}>
            {/* Button to open dropdown */}
            <button
                onClick={toggleDropdown}
                style={{ borderColor: 'rgba(201, 201, 201, 1)' }}
                className="w-full px-4 py-3 text-left bg-white border text-black font-medium rounded-lg shadow-sm focus:outline-hidden flex justify-between items-center"
            >
                {selectedOption ? selectedOption.label : placeholder}
                <span>
                    <svg width="12" height="6" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L7 7L1 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleOptionClick(option)}
                            className="px-4 py-2 hover:bg-kudu-orange hover:text-white cursor-pointer"
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
