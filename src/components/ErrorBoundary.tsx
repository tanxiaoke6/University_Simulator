import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleWipeSave = () => {
        if (confirm('确定要清除所有存档数据吗？这通常能修复因存档损坏导致的崩溃。')) {
            localStorage.removeItem('university-simulator-save');
            window.location.reload();
        }
    };

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full glass-card p-8 border-red-500/30 animate-scale-in text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-display font-bold text-white mb-2">程序崩溃了</h1>
                        <p className="text-dark-400 text-sm mb-6">
                            抱歉，游戏运行中遇到了致命错误。这可能是由存档数据损坏引起的。
                        </p>

                        <div className="bg-dark-900 rounded-xl p-4 mb-8 text-left border border-dark-800">
                            <p className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest mb-1">Error Trace</p>
                            <p className="text-xs font-mono text-dark-300 break-all line-clamp-3">
                                {this.state.error?.message || 'Unknown render error'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="action-btn-primary w-full justify-center py-3"
                            >
                                <RotateCcw className="w-4 h-4" />
                                尝试重新加载
                            </button>

                            <button
                                onClick={this.handleWipeSave}
                                className="action-btn-secondary w-full justify-center py-3 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                清除坏档并重启
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
