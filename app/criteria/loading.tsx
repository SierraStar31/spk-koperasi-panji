export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-600">Memuat kriteria...</p>
      </div>
    </div>
  );
}
