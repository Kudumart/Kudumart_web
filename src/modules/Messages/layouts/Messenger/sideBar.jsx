import Imgix from "react-imgix";
import SearchInput from "../../components/SearchInput";
import Loader from "../../../../components/Loader";


const UserCard = ({ user, currentUser, onClick }) => {
    
    const lastMessage = user.message.at(-1);

    const renderedUser = user?.receiverUser?.id === currentUser?.id ? user?.senderUser : user?.receiverUser;

    return (
        <div className="flex items-start w-full gap-4 py-2 border-b border-gray-200 cursor-pointer" onClick={onClick}>
            <div className="shrink-0 w-14 h-14">
                <Imgix
                    src={renderedUser.photo ? renderedUser?.photo : 'https://res.cloudinary.com/do2kojulq/image/upload/v1735426601/kudu_mart/profile_icon_yq3gnr.png'}
                    alt={user.firstName}
                    width={56}
                    height={56}
                    sizes="100vw"
                    className="rounded-full object-cover h-14 w-14"
                />
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold">{renderedUser?.firstName}</h3>
                </div>
                <p className="text-sm font-medium text-gray-600">{user.product.name}</p>
                <p className="text-xs text-gray-500 overflow-hidden text-ellipsis">{lastMessage?.content}</p>
            </div>
        </div>
    );
};


export default function ChatSideBar({setOpenedMessage, currentUser, conversations, isLoading}) {
    // const openedMessage = (data) => {
    //     setOpenedMessage(data)
    // }

    if(isLoading) return <Loader/>;

    return (
        <>
            <div className="md:w-[32%] w-full flex flex-col gap-2 mt-px bg-white relative">
                {/** Search Bar */}
                <div className="w-full flex px-10 md:py-5 py-2 md:mt-0 mt-2 relative">
                    <SearchInput />
                </div>

                <div className="w-full flex flex-col h-full overflow-auto px-5 pb-5 md:pb-0 md:mt-0 mt-2 md:mb-0 md:gap-8 gap-10">
                    {conversations?.map((item, index) => (
                        <UserCard currentUser={currentUser} onClick={() => setOpenedMessage(item)} key={index} user={item}  />
                    ))}
                </div>
            </div>
        </>
    )
}













