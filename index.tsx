
import React, { ReactNode, ErrorInfo, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fix: Explicitly extending Component from the react import ensures that props and state are correctly inherited and typed via the provided generics.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Initializing state as a class field with explicit typing ensures compatibility with the generic State parameter.
  public state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    // Check if the application state has an error
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Error de Aplicación</h1>
          <p className="text-slate-600 mb-4">Algo impidió que la aplicación se cargara correctamente.</p>
          <pre className="bg-white p-4 rounded shadow text-xs text-left overflow-auto max-w-lg mx-auto mb-4 border border-red-100">
            {this.state.error?.message}
          </pre>
          <button 
             onClick={() => window.location.reload()}
             className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Recargar
          </button>
        </div>
      );
    }
    // Fix: Accessing children via this.props is now properly recognized by TypeScript as part of the Component inheritance.
    return this.props.children;
  }
}

// Mount Logic
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error("FATAL: No se encontró el elemento #root");
}
