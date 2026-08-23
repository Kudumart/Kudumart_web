import Messenger from "./layouts/Messenger";

export default function Messages() {
  return (
    // Use 100dvh and subtract the two fixed header bars (~110px).
    // This avoids relying on parent flex/height which the landing layout doesn't provide.
    <div
      className="w-full bg-gray-100"
      style={{ height: "calc(100dvh - 110px)", marginTop: "110px" }}
    >
      <div className="h-full max-w-7xl mx-auto md:px-4 md:py-4 flex flex-col">
        <Messenger />
      </div>
    </div>
  );
}