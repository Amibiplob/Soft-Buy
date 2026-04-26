import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32">
      <h1 className="text-7xl font-semibold tracking-tight">404</h1>

      <h2 className="mt-3 text-xl font-medium">Page Not Found</h2>

      <p className="mt-2 text-sm text-gray-500">
        Sorry, the page you are looking for doesn’t exist.
      </p>

      <Link
        href="/"
        className="mt-6 px-5 py-2 text-sm bg-black text-white rounded-lg hover:opacity-80 transition"
      >
        Go back home
      </Link>
    </div>
  );
}
