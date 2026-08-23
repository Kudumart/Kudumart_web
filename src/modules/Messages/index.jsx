import Messenger from "./layouts/Messenger";

export default function Messages() {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      {/* Full-height messenger container */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-0 md:px-4 md:py-6">
        <Messenger />
      </div>
    </div>
  );
}