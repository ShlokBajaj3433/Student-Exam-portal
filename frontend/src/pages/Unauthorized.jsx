import { useNavigate } from 'react-router-dom';

/**
 * Unauthorized — 403 Forbidden page.
 *
 * Displayed when an authenticated user attempts to access a route
 * that requires a role they do not possess.
 */
function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-md p-10">
        {/* Status code */}
        <p className="text-6xl font-extrabold text-red-500 mb-2">403</p>

        {/* Heading */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Access Forbidden
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-8">
          You don&apos;t have permission to view this page. If you believe this
          is a mistake, please contact your administrator.
        </p>

        {/* Go Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          &larr; Go Back
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
