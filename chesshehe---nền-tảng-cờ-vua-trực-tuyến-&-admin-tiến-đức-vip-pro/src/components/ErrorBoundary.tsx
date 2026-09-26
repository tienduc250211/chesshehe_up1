import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {

    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Chesshehe:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('chesshehe_profile');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#161512] text-stone-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-amber-300">Đã khôi phục giao diện an toàn</h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Hệ thống đã ngăn chặn lỗi màn hình trắng và bảo vệ an toàn phiên làm việc cờ vua của bạn.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-[11px] font-mono text-stone-400 text-left overflow-auto max-h-24">
                {this.state.error.message || 'Lỗi không xác định'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                Tải lại ứng dụng
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-stone-700"
              >
                <Home className="w-4 h-4" />
                Khôi phục mặc định
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
