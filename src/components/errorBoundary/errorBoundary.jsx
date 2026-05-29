// components/errorBoundary.jsx

import React from "react";
import ErrPage from "../../pages/fallback/ErrPage";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("Global Crash:", error);
        console.error(info);
    }

    render() {
        if (this.state.error)
            return (
                <ErrPage
                    code={500}
                    message={this.state.error.message}
                />
            );

        return this.props.children;
    }
}