export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-stone-900 p-8 max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center border-b pb-6">
        <div className="space-y-2">
          <div className="h-8 bg-stone-200 rounded w-64"></div>
          <div className="h-4 bg-stone-100 rounded w-48"></div>
        </div>
        <div className="h-10 bg-stone-200 rounded w-32"></div>
      </div>

      <div className="space-y-6">
        <div className="h-40 bg-stone-100 rounded-xl"></div>
        <div className="h-64 bg-stone-100 rounded-xl"></div>
      </div>
    </div>
  );
}
