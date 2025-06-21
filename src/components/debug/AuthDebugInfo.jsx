// src/components/debug/AuthDebugInfo.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthDebugInfo = () => {
    const auth = useAuth();
    const [debugInfo, setDebugInfo] = useState(null);
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        if (showDebug && auth.getDebugInfo) {
            const info = auth.getDebugInfo();
            setDebugInfo(info);
        }
    }, [showDebug, auth]);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setShowDebug(!showDebug)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
                🔐 Auth Debug
            </button>

            {showDebug && (
                <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 max-h-96 overflow-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">Authentication Debug</h4>
                        <button
                            onClick={() => setShowDebug(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {debugInfo && (
                        <div className="space-y-2 text-xs">
                            <div>
                                <strong>Auth State:</strong>
                                <div className="ml-2">
                                    <div>Authenticated: {debugInfo.isAuthenticated ? '✅' : '❌'}</div>
                                    <div>Session Validated: {debugInfo.sessionValidated ? '✅' : '❌'}</div>
                                    <div>Loading: {debugInfo.loading ? '⏳' : '✅'}</div>
                                </div>
                            </div>

                            <div>
                                <strong>User Data:</strong>
                                <pre className="ml-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(debugInfo.user, null, 2)}
                                </pre>
                            </div>

                            {debugInfo.authServiceDebug && (
                                <div>
                                    <strong>Auth Service:</strong>
                                    <div className="ml-2">
                                        <div>Has Token: {debugInfo.authServiceDebug.hasToken ? '✅' : '❌'}</div>
                                        <div>Token Length: {debugInfo.authServiceDebug.tokenLength || 'N/A'}</div>
                                        <div>API Base URL: {debugInfo.authServiceDebug.apiBaseUrl}</div>
                                    </div>
                                </div>
                            )}

                            {debugInfo.authServiceDebug?.tokenInfo && (
                                <div>
                                    <strong>Token Info:</strong>
                                    <pre className="ml-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                                        {JSON.stringify(debugInfo.authServiceDebug.tokenInfo, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <div className="pt-2 border-t">
                                <button
                                    onClick={() => {
                                        console.log('Full debug info:', debugInfo);
                                        console.log('Auth service debug:', window.authService?.getDebugInfo());
                                    }}
                                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs mr-2"
                                >
                                    Log to Console
                                </button>

                                <button
                                    onClick={() => auth.refreshSession?.()}
                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-2"
                                >
                                    Refresh Session
                                </button>

                                <button
                                    onClick={() => setDebugInfo(auth.getDebugInfo?.())}
                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                >
                                    Refresh Info
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuthDebugInfo;