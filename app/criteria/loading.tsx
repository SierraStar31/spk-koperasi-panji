import { AppSkeleton } from "@/app/components/AppSkeleton";

export default function Loading() {
  return (
    <AppSkeleton>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-stone-200 rounded w-48"></div>
          <div className="h-4 bg-stone-100 rounded w-72"></div>
        </div>
        <div className="h-10 bg-stone-200 rounded w-32"></div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
        <div className="h-6 bg-stone-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100">
              <div className="h-4 bg-stone-100 rounded w-16"></div>
              <div className="h-4 bg-stone-200 rounded w-48"></div>
              <div className="h-4 bg-stone-100 rounded w-24"></div>
              <div className="h-4 bg-stone-100 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </AppSkeleton>
  );
}
