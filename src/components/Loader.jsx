import { BeatLoader } from "react-spinners";

export default function Loader({size=20}) {
    return (
        <div className="flex w-full justify-center">
            <BeatLoader
                color={'rgba(255, 111, 34, 1)'}
                loading={true}
                size={size}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    )
}