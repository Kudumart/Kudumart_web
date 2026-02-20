import Imgix from "react-imgix";
import { Link } from "react-router-dom";

export default function Sidebar({ onSelected }) {
  return (
    <div
      className={`h-full bg-white rounded-md flex-col w-full md:w-[22%] relative md:fixed flex overflow-auto bg-mobiDarkCloud transition-all mb-10`}
    >
      {/* Logo */}
      <div className="py-6 px-4 flex gap-2 flex-col space-x-2 border-bottom">
        <div className="flex px-3 justify-center">
          <Link to={"/"}>
            <Imgix
              src="https://res.cloudinary.com/do2kojulq/image/upload/v1735426588/kudu_mart/kudum1_nsw4jg.png"
              sizes="20vw"
              width={100}
              height={33}
            />
          </Link>
        </div>
        <div className="w-full h-px border-mobiSilverDivider border-bottom border"></div>
      </div>

      {/* Navigation Items */}
      <nav className="px-4 space-y-5">
        <Link
          to={"/vendor/dashboard"}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.0799 21 6.2 21H8.2C8.48003 21 8.62004 21 8.727 20.9455C8.82108 20.8976 8.89757 20.8211 8.9455 20.727C9 20.62 9 20.48 9 20.2V13.6C9 13.0399 9 12.7599 9.10899 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75992 12 10.0399 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V20.2C15 20.48 15 20.62 15.0545 20.727C15.1024 20.8211 15.1789 20.8976 15.273 20.9455C15.38 21 15.52 21 15.8 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764Z"
                stroke={"currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </i>
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link
          to={"#"}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.5562 7.055L13.3062 2.54094C13.0858 2.41914 12.8381 2.35526 12.5862 2.35526C12.3344 2.35526 12.0867 2.41914 11.8662 2.54094L3.61624 7.05688C3.38064 7.18579 3.18396 7.37559 3.04676 7.60646C2.90956 7.83734 2.83685 8.10081 2.83624 8.36938V17.3356C2.83685 17.6042 2.90956 17.8677 3.04676 18.0985C3.18396 18.3294 3.38064 18.5192 3.61624 18.6481L11.8662 23.1641C12.0867 23.2859 12.3344 23.3498 12.5862 23.3498C12.8381 23.3498 13.0858 23.2859 13.3062 23.1641L21.5562 18.6481C21.7918 18.5192 21.9885 18.3294 22.1257 18.0985C22.2629 17.8677 22.3356 17.6042 22.3362 17.3356V8.37032C22.3361 8.10127 22.2637 7.83721 22.1264 7.6058C21.9892 7.37439 21.7923 7.18414 21.5562 7.055ZM12.5862 3.85344L20.1181 7.97844L17.3272 9.50657L9.79437 5.38157L12.5862 3.85344ZM12.5862 12.1034L5.05437 7.97844L8.23249 6.23844L15.7644 10.3634L12.5862 12.1034ZM4.33624 9.29094L11.8362 13.3953V21.4381L4.33624 17.3366V9.29094ZM20.8362 17.3328L13.3362 21.4381V13.3991L16.3362 11.7575V15.1034C16.3362 15.3024 16.4153 15.4931 16.5559 15.6338C16.6966 15.7744 16.8873 15.8534 17.0862 15.8534C17.2852 15.8534 17.4759 15.7744 17.6166 15.6338C17.7572 15.4931 17.8362 15.3024 17.8362 15.1034V10.9363L20.8362 9.29094V17.3319V17.3328Z"
                fill="currentColor"
              />
            </svg>
          </i>
          <span className={`text-sm font-medium`}>Manage Products</span>
        </Link>
        <Link
          to={"#"}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.3966 13.1724L14.0863 3.86212C13.9475 3.72223 13.7823 3.61131 13.6002 3.53583C13.4182 3.46035 13.223 3.4218 13.0259 3.42243H4.33625C4.13734 3.42243 3.94657 3.50145 3.80592 3.6421C3.66527 3.78275 3.58625 3.97352 3.58625 4.17243V12.8621C3.58562 13.0592 3.62417 13.2544 3.69965 13.4364C3.77513 13.6184 3.88604 13.7836 4.02594 13.9224L13.3363 23.2327C13.4755 23.3721 13.6409 23.4826 13.8229 23.558C14.0049 23.6334 14.2 23.6722 14.397 23.6722C14.594 23.6722 14.7891 23.6334 14.9711 23.558C15.1531 23.4826 15.3185 23.3721 15.4578 23.2327L23.3966 15.294C23.5359 15.1547 23.6464 14.9893 23.7218 14.8073C23.7972 14.6253 23.836 14.4302 23.836 14.2332C23.836 14.0362 23.7972 13.8411 23.7218 13.6591C23.6464 13.4771 23.5359 13.3117 23.3966 13.1724ZM14.3966 22.1724L5.08625 12.8621V4.92243H13.0259L22.3363 14.2327L14.3966 22.1724ZM9.58625 8.29743C9.58625 8.51994 9.52027 8.73744 9.39665 8.92245C9.27304 9.10745 9.09734 9.25165 8.89177 9.3368C8.6862 9.42195 8.46 9.44422 8.24177 9.40082C8.02354 9.35741 7.82309 9.25026 7.66575 9.09293C7.50842 8.93559 7.40127 8.73514 7.35787 8.51691C7.31446 8.29868 7.33674 8.07248 7.42189 7.86691C7.50703 7.66135 7.65123 7.48564 7.83623 7.36203C8.02124 7.23841 8.23875 7.17243 8.46125 7.17243C8.75962 7.17243 9.04577 7.29096 9.25675 7.50194C9.46772 7.71291 9.58625 7.99906 9.58625 8.29743Z"
                fill="currentColor"
              />
            </svg>
          </i>
          <span className={`text-sm font-medium`}>Manage Orders</span>
        </Link>
        <a
          to="#"
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg hover:bg-kudu-light-gray  text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="14"
              viewBox="0 0 22 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.7106 7.57514L17.43 1.15983C17.2937 0.954354 17.1087 0.785787 16.8915 0.669157C16.6743 0.552526 16.4316 0.491458 16.185 0.491394H2.33624C1.93842 0.491394 1.55689 0.649429 1.27558 0.930734C0.994278 1.21204 0.836243 1.59357 0.836243 1.99139V13.9914C0.836243 14.3892 0.994278 14.7707 1.27558 15.0521C1.55689 15.3334 1.93842 15.4914 2.33624 15.4914H16.185C16.4314 15.4909 16.6738 15.4298 16.891 15.3134C17.1081 15.197 17.2933 15.0288 17.43 14.8239L21.7078 8.40764C21.7905 8.28467 21.8348 8.13998 21.8353 7.99182C21.8358 7.84366 21.7924 7.69867 21.7106 7.57514ZM16.185 13.9914H2.33624V1.99139H16.185L20.1844 7.99139L16.185 13.9914Z"
                fill="black"
              />
            </svg>
          </i>
          <span className="text-sm font-medium">Manage Auctions</span>
        </a>
        <a
          href="#"
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg hover:bg-kudu-light-gray  text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="15"
              viewBox="0 0 23 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.7 18H2.3C1.69 18 1.10499 17.7893 0.673654 17.4142C0.242321 17.0391 0 16.5304 0 16V2C0 1.46957 0.242321 0.960859 0.673654 0.585786C1.10499 0.210714 1.69 0 2.3 0H20.7C21.31 0 21.895 0.210714 22.3263 0.585786C22.7577 0.960859 23 1.46957 23 2V16C23 16.5304 22.7577 17.0391 22.3263 17.4142C21.895 17.7893 21.31 18 20.7 18ZM2.3 4V16H20.7V4H2.3ZM10.35 13.121L6.08695 9.414L7.71305 8L10.35 10.293L15.287 6L16.913 7.414L10.35 13.121Z"
                fill="currentColor"
              />
            </svg>
          </i>
          <span className="text-sm font-medium"> View Transactions </span>
        </a>
        <Link
          to={"#"}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg text-mobiRomanSilver transition`}
        >
          <i className="mr-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 21H10M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z"
                stroke={"currentColor"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </i>
          <span className={`text-sm font-medium`}>Notification</span>
        </Link>

        <div className="w-full h-px px-4 border-mobiSilverDivider border-bottom border"></div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-6">
        <Link
          to={"#"}
          onClick={() => onSelected(false)}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg transition`}
        >
          <i className={`fas fa-cog mr-3`}></i>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <a
          href="#"
          onClick={() => onSelected(false)}
          className={`flex items-center py-2 px-4 h-[57px] rounded-lg text-red-500 hover:bg-kudu-light-gray  transition`}
        >
          <i className="fas fa-sign-out-alt mr-3"></i>
          <span className="text-sm font-medium">Logout</span>
        </a>
      </div>
    </div>
  );
}
