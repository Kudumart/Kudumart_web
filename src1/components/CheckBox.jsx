import React from 'react';
import { Checkbox as MaterialCheckbox } from '@material-tailwind/react';

export default function Checkbox({ name, register, rules, errors, label }) {
    return (
        <div className="flex flex-col gap-3 text-base">
            <MaterialCheckbox
                {...register(name, rules)}
                id={name}
                color="black" // Specify the color as needed
                label={label}
            />
            {errors ? (
                <p style={{ color: 'red' }} className="-mt-2">{errors[name]?.message}</p>
            ) : null}
        </div>
    );
}
