export default function SimpleLoader() {
  return (
    <div className="p-4 h-[540px] grid place-items-center shadow bg-base-100 rounded-md">
      <div className="space-x-2">
        <span className="loading loading-spinner loading-xl"></span>
        <span className="text-xl">Loading</span>
      </div>
    </div>
  );
}

export function SmallerLoader() {
  return (
    <div className="p-4 h-[240px] grid place-items-center shadow bg-base-100 rounded-md">
      <div className="space-x-2">
        <span className="loading loading-spinner loading-xl"></span>
        <span className="text-xl">Loading</span>
      </div>
    </div>
  );
}
