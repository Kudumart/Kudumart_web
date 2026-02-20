import React from "react";
import { useState } from "react";

export default function Input({ icon, appendIcon, type, style, placeholder, background, name, disabled, value, register, rules, errors }) {
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value || "");
    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <>
            <div className={`flex items-center border px-3 py-1.5 rounded-[7px] ${background}`} style={style}>
                {icon ?
                    <img src={`${icon}`} width={10} height={10} alt="icon" />
                    :
                    null}

                <input
                    type={type === 'password' ? (passwordOpen ? 'text' : type) : type}
                    placeholder={`${placeholder}`}
                    className="peer w-full h-full bg-transparent font-sans font-normal outline-hidden focus:outline-hidden disabled:border-0 disabled:cursor-auto transition-all placeholder:opacity-100 text-sm px-3 py-2 rounded-[7px]"
                    style={{ borderColor: 'transparent', border: '0px !important' }}
                    {...register(name, rules)}
                    value={inputValue}
                    onChange={handleChange}
                    autoComplete="off"
                    disabled={disabled}
                />

                {appendIcon ?
                    <img src={`${appendIcon}`} width={20} height={20} alt="icon"
                        className="cursor-pointer"
                        onClick={() => setPasswordOpen(!passwordOpen)} />
                    :
                    null}
            </div>
            {errors ? (
                <p style={{ color: 'red' }} className="-mt-2">{errors[name]?.message}</p>
            ) : null}
        </>
    )
}