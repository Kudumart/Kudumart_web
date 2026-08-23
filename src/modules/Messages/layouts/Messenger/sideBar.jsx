import Imgix from "react-imgix";
import SearchInput from "../../components/SearchInput";
import { FiUser } from "react-icons/fi";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/do2kojulq/image/upload/v1735426601/kudu_mart/profile_icon_yq3gnr.png";

const UserCard = ({ user, currentUser, onClick, isSelected }) => {
  const lastMessage = user.message?.at(-1);
  const renderedUser =
    user?.receiverUser?.id === currentUser?.id
      ? user?.senderUser
      : user?.receiverUser;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-orange-50 focus:outline-none border-l-4 ${
        isSelected
          ? "bg-orange-50 border-orange-500"
          : "border-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100">
          {renderedUser?.photo ? (
            <Imgix
              src={renderedUser.photo}
              alt={renderedUser?.firstName || "User"}
              width={44}
              height={44}
              sizes="44px"
              className="w-11 h-11 object-cover"
            />
          ) : (
            <div className="w-11 h-11 flex items-center justify-center bg-gray-200">
              <FiUser className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {renderedUser?.firstName} {renderedUser?.lastName}
          </p>
          {lastMessage?.createdAt && (
            <span className="text-[10px] text-gray-400 shrink-0">
              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-orange-500 truncate">{user.product?.name}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </button>
  );
};

/* ── Skeleton loader ── */
const SkeletonCard = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      <div className="h-2 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

export default function ChatSideBar({
  setOpenedMessage,
  currentUser,
  conversations,
  isLoading,
  selectedId,
}) {
  return (
    // h-full fills the overflow-hidden parent in Messenger/index.jsx
    <div className="flex flex-col h-full bg-white">
      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100 shrink-0">
        <SearchInput />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !conversations?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">No conversations yet</p>
          </div>
        ) : (
          conversations.map((item, index) => (
            <UserCard
              key={item.id || index}
              currentUser={currentUser}
              onClick={() => setOpenedMessage(item)}
              user={item}
              isSelected={selectedId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
