
import React, { ReactNode, ErrorInfo } from 'react';
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

// Fix: Extending React.Component and declaring state/props properties to ensure TypeScript 
// correctly identifies 'this.props' and 'this.state' as members of the class.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly declare the state and props properties to resolve compilation errors 
  // where these members are not recognized on the class instance.
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  // Fix: Explicit constructor with super(props) and state initialization ensures 
  // the base class is properly initialized and state is typed.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render(): ReactNode {
    // Fix: Accessing 'this.state' now correctly resolves through the declared property.
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
    // Fix: Accessing 'this.props' now correctly resolves through the declared property.
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
