// src/components/common/ErrorBoundary.jsx - Enhanced Error Boundary with Recovery
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In production, you might want to log this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: logErrorToService(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                disabled={this.state.retryCount >= 3}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Try Again {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}</span>
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Go Home</span>
                            </button>
                        </div>

                        {this.state.retryCount >= 3 && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    Multiple retry attempts failed. Please contact technical support.
                                </p>
                            </div>
                        )}

                        {isDevelopment && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center">
                                    <Bug className="w-4 h-4 mr-2" />
                                    Debug Information (Development Only)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 max-h-40 overflow-auto">
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    <br />
                                    <strong>Stack Trace:</strong>
                                    <pre className="whitespace-pre-wrap mt-1">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (WrappedComponent, errorFallback) => {
    return function WithErrorBoundaryComponent(props) {
        return (
            <ErrorBoundary fallback={errorFallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
    const [error, setError] = React.useState(null);

    const resetError = () => setError(null);

    const captureError = (error) => {
        console.error('Error captured:', error);
        setError(error);
    };

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { captureError, resetError };
};

// Component for displaying API errors with retry functionality
export const ApiErrorFallback = ({ error, onRetry, message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                    {message || 'Failed to load data'}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                    {error?.message || 'An unexpected error occurred while fetching data.'}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 inline-flex items-center space-x-1 text-sm font-medium text-red-800 hover:text-red-900"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Try again</span>
                    </button>
                )}
            </div>
        </div>
    </div>
);

// Component for handling loading states with timeout
export const LoadingWithTimeout = ({
                                       isLoading,
                                       timeout = 30000,
                                       onTimeout,
                                       children,
                                       loadingComponent
                                   }) => {
    const [hasTimedOut, setHasTimedOut] = React.useState(false);

    React.useEffect(() => {
        if (!isLoading) {
            setHasTimedOut(false);
            return;
        }

        const timer = setTimeout(() => {
            setHasTimedOut(true);
            onTimeout && onTimeout();
        }, timeout);

        return () => clearTimeout(timer);
    }, [isLoading, timeout, onTimeout]);

    if (hasTimedOut) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                    <div>
                        <h3 className="text-sm font-medium text-yellow-800">
                            Loading is taking longer than expected
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            The server might be experiencing high load. Please check your connection and try again.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return loadingComponent || (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;