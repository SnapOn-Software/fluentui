import * as React from "react";
import { GetLogger } from "../_modules/config";

const logger = GetLogger("ErrorBoundary");

interface iProps {
    errorComponent?: JSX.Element,
    /** If changeMarker changes, it will check the error again */
    changeMarker: string | number
}
interface iState { hasError: boolean; marker: string | number; }
export class ErrorBoundary extends React.Component<React.PropsWithChildren<iProps>, iState> {
    constructor(props: iProps) {
        super(props);
        this.state = { hasError: false, marker: props.changeMarker };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    static getDerivedStateFromProps(props: iProps, state: iState) {
        if (props.changeMarker !== state.marker)
            return { hasError: false, marker: props.changeMarker };
        else return null;
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        logger.error(error);
        logger.error(errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return this.props.errorComponent || <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}