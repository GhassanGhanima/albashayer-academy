'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
                    <div className="glass-card p-8 rounded-[40px] max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">حدث خطأ غير متوقع</h2>
                        <p className="text-gray-400 mb-6">
                    نعتذر عن هذا الإخطار. يبدو أن هناك مشكلة تقنية.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
                                <p className="text-sm text-red-400 font-mono break-words">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-full justify-center"
                        >
                            <RefreshCw className="w-5 h-5" />
                            <span>إعادة تحميل الصفحة</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
