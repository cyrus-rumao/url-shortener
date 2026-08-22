const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-8xl font-bold">404</h1>

      <p className="mt-4 text-xl">Page not found</p>

      <p className="mt-2 text-gray-500">
        The page you're looking for doesn't exist.
      </p>

      <a href="/" className="mt-6 rounded-lg bg-black px-5 py-3 text-white">
        Go Home
      </a>
    </div>
  );
};

export default NotFound;
