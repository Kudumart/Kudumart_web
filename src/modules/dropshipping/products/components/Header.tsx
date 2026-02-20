import { Link } from "react-router-dom";
import CountrySelect from "../../../../layouts/landing/CountrySelect";
import { Menu } from "lucide-react";
export default function DropshipHeader({
  showMenu,
  showTitle,
}: {
  showMenu?: boolean;
  showTitle?: boolean;
}) {
  return (
    <div className="h-14 border-b border-current/20 px-4 flex items-center">
      {showTitle && (
        <h1 className="text-xl font-bold">
          <img
            className="h-10"
            src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737497178/kuduMart/kudum_2_c8qm7a.png"
            alt=""
          />
        </h1>
      )}

      {showMenu && (
        <label
          htmlFor="my-drawer-3"
          className="btn drawer-button lg:hidden btn-square"
        >
          <Menu />
        </label>
      )}
      <div className="ml-auto flex items-center">
        <CountrySelect />
        <Link to="/admin/dashboard" className="btn btn-primary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
