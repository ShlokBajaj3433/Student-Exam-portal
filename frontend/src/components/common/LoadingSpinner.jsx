/**
 * LoadingSpinner — a simple full-viewport centered spinner using Tailwind CSS.
 * Used by ProtectedRoute while the AuthContext is rehydrating on initial load.
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export default LoadingSpinner;
