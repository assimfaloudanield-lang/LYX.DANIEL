import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', backgroundColor: 'black', height: '100%', width: '100%', position: 'fixed', top: 0, left: 0, overflow: 'auto', zIndex: 9999 }}>
          <h2>React Crash:</h2>
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
