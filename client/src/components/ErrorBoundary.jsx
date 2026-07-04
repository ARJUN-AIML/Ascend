import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-body)',
          color: 'var(--text-1)',
          fontFamily: 'var(--font)',
          padding: 20,
          textAlign: 'center'
        }}>
          <h1 style={{ color: 'var(--red)', marginBottom: 12 }}>Something went wrong.</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>An unexpected error occurred in the application.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--purple)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font)'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
