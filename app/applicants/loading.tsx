import { AppSkeleton } from "@/app/components/AppSkeleton";

export default function Loading() {
  return (
    <AppSkeleton>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-stone-200 rounded w-56"></div>
          <div className="h-4 bg-stone-100 rounded w-80"></div>
        </div>
        <div className="h-10 bg-stone-100 rounded w-44"></div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <div className="h-6 bg-stone-200 rounded w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-stone-100 rounded w-28"></div>
              <div className="h-10 bg-stone-50 border border-stone-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <div className="h-6 bg-stone-200 rounded w-56"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-stone-50 border border-stone-100 rounded-lg"></div>
        ))}
      </div>
    </AppSkeleton>
  );
}
