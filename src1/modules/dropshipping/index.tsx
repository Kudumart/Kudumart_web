import useSelectItem, { useSingleSelect } from "../../helpers/selectors";
import AliCategories from "./products/components/AliCategories";
import GetDropShipProducts from "./products/components/GetProducts";
import DropshipHeader from "./products/components/Header";

export default function DropShippingProducts() {
  const props = useSingleSelect<number>(6);
  return (
    <>
      <div className="drawer lg:drawer-open" data-theme="kudu">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <DropshipHeader showMenu />
          {/*<div className="h-14">
            <label
              htmlFor="my-drawer-3"
              className="btn drawer-button lg:hidden"
            >
              Open drawer
            </label>
          </div>*/}
          <section className="p-4 w-full">
            <GetDropShipProducts selectProps={props} />
          </section>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-3"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <AliCategories selectProps={props} />
        </div>
      </div>
    </>
  );
  return (
    <div data-theme="kudu">
      <div className="h-14 border-b border-b-current/20"></div>
      <section className="flex">
        <div className="flex-1 max-w-2xs">
          <AliCategories selectProps={props} />
        </div>
        <div className="flex-1 p-4">
          <GetDropShipProducts selectProps={props} />
        </div>
      </section>
    </div>
  );
}
