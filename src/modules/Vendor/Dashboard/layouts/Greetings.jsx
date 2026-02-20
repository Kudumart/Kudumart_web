function Greeting() {
    return (
        <div className="bg-linear-to-r from-orange-500 to-black-900 text-white px-4 py-10 md:mt-3 rounded-lg w-full">
            <div className="flex gap-6">
                <div className="flex grow gap-1">
                    <h2 className="text-lg">Hello, Victor</h2>
                </div>
                <div className="flex items-center py-2 bg-kudu-orange-fade px-5 rounded-md" style={{ width: 'fit-content' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 19C2 20.7 3.3 22 5 22H19C20.7 22 22 20.7 22 19V11H2V19ZM19 4H17V3C17 2.4 16.6 2 16 2C15.4 2 15 2.4 15 3V4H9V3C9 2.4 8.6 2 8 2C7.4 2 7 2.4 7 3V4H5C3.3 4 2 5.3 2 7V9H22V7C22 5.3 20.7 4 19 4Z" fill="white" />
                    </svg>
                    <p className="ml-2">Oct 3, 2024</p>
                </div>
            </div>
        </div>
    );
}

export default Greeting