import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <h2 className="text-2xl">Something went wrong.</h2>
                    <p>We're working to fix it. Please try again later.</p>
                </div>
            );
        } else {
            return (
                <div className="mt-10 flex flex-col gap-7" style={{ textAlign: "center", padding: "20px" }}>
                    <img
                        src="https://res.cloudinary.com/greenmouse-tech/image/upload/v1737497178/kuduMart/kudum_2_c8qm7a.png"
                        width={150}
                        height={230}
                        style={{margin: '0 auto'}}
                    />
                    <h2 className="md:text-2xl text-lg font-bold">Something went wrong.</h2>
                    <p className="-mt-5">We're working to fix it. Please try again later.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
