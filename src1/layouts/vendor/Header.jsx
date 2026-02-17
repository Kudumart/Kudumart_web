import 'animate.css';
import { Link } from 'react-router-dom';
import Imgix from 'react-imgix';

export default function Header({ openMenu }) {
    const toggleMenu = () => {
        openMenu()
    }

    return (
        <div className="bg-white shadow-md md:hidden relative w-full z-90 py-2 lg:py-0 md:py-0">
            <div className="w-full flex items-center justify-between xl:px-80 lg:px-36 md:px-4 px-5">
                {/* Logo Section */}
                <div className="lg:flex md:flex hidden">
                    <Link to="/">
                        <Imgix src='https://res.cloudinary.com/do2kojulq/image/upload/v1735426588/kudu_mart/kudum1_nsw4jg.png'
                            sizes='20vw'
                            width={165}
                            height={67}
                        />
                    </Link>
                </div>
                <div className="lg:hidden md:hidden flex">
                    <Link to="/">
                        <Imgix src='https://res.cloudinary.com/do2kojulq/image/upload/v1735426588/kudu_mart/kudum1_nsw4jg.png'
                            sizes='20vw'
                            width={100}
                            height={33}
                        />
                    </Link>
                </div>
                {/* Mobile Navigation Toggle */}
                <div className="md:hidden">
                    <button
                        className="text-black focus:outline-hidden"
                        aria-label="Open Menu"
                        id="mobile-menu-button"
                        onClick={() => toggleMenu()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
