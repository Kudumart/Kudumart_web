import { useState } from "react";

const SafeHTML = ({ htmlContent, maxLength = 300 }) => {
    const [expanded, setExpanded] = useState(false);
    
    const toggleExpand = () => setExpanded(!expanded);
    
    return (
        <div>
            <div
                dangerouslySetInnerHTML={{
                    __html: expanded ? htmlContent : htmlContent.slice(0, maxLength) + (htmlContent.length > maxLength ? "..." : "")
                }}
            />
            {htmlContent.length > maxLength && (
                <button 
                    onClick={toggleExpand} 
                    className="text-blue-500 underline mt-2 cursor-pointer"
                >
                    {expanded ? "See Less" : "See More"}
                </button>
            )}
        </div>
    );
};

export default SafeHTML;
