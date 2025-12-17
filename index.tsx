import React, { ReactNode, ErrorInfo, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Iniciando aplicación KitchenManager...");

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-100">
            <h1 className="text-xl font-bold text-slate-800 mb-2">Algo ha salido mal</h1>
            <p className="text-slate-500 mb-6 text-sm">Se ha producido un error al renderizar la aplicación.</p>
            
            <details className="mb-6 text-left bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-200 overflow-auto max-h-32">
              <summary className="cursor-pointer font-bold mb-1">Ver detalles técnicos</summary>
              <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
            </details>

            <div className="flex gap-3 justify-center">
              <button 
                 onClick={() => window.location.reload()}
                 className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
              >
                Recargar
              </button>
              <button 
                 onClick={() => { localStorage.clear(); window.location.reload(); }}
                 className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
              >
                Restablecer de Fábrica
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("React mount command sent.");
  } catch (e) {
    console.error("Error mounting React root:", e);
    document.body.innerHTML += `<div style="color:red; padding:20px">Error crítico montando React: ${e}</div>`;
  }
} else {
  console.error("FATAL: Root element not found");
}