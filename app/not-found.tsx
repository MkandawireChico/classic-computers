import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-600">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-card bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
      >
        Back to home
      </Link>
    </div>
  );
}
