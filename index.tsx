import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Algo ha salido mal</h1>
            <p className="text-slate-500 mb-6 text-sm">Se ha producido un error al cargar la aplicación. Puede deberse a un problema con los datos guardados.</p>
            
            <details className="mb-6 text-left bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-200 overflow-auto max-h-32">
              <summary className="cursor-pointer font-bold mb-1">Ver detalles del error</summary>
              <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
            </details>

            <div className="flex gap-3 justify-center">
              <button 
                 onClick={() => window.location.reload()}
                 className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
              >
                Recargar Página
              </button>
              <button 
                 onClick={() => { localStorage.clear(); window.location.reload(); }}
                 className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                 title="Esto borrará todas las recetas guardadas para recuperar la app"
              >
                Restablecer Datos
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);