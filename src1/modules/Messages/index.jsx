
import Messenger from "./layouts/Messenger";

export default function Messages() {

    return <>
        <div className="w-full flex flex-col bg-kudu-light-blue">
            <div className="w-full flex flex-col xl:px-80 lg:pl-44 md:mt-24 mt-12 md:mt-10 lg:pr-36 md:px-4 pt-3 md:py-0 lg:gap-10 md:gap-8 gap-5">

                {/** DESKTOP MESSAGING BLOCK */}
                <div className="md:w-[78.5%] xl:w-[71%] w-full flex max-h-[83vh] md:fixed">
                    <div className="bg-kudu-light-blue w-full flex-col relative max-h-[83vh]">
                        <Messenger />
                    </div>
                </div>


            </div>
        </div>
    </>
}