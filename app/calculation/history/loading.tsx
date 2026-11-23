import { AppSkeleton } from "@/app/components/AppSkeleton";

export default function Loading() {
  return (
    <AppSkeleton>
      <div className="space-y-2">
        <div className="h-8 bg-stone-200 rounded w-56"></div>
        <div className="h-4 bg-stone-100 rounded w-72"></div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 flex justify-between items-center">
            <div className="space-y-3">
              <div className="h-5 bg-stone-200 rounded w-48"></div>
              <div className="h-4 bg-stone-100 rounded w-64"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-stone-200 rounded w-28"></div>
              <div className="h-10 bg-stone-200 rounded w-28"></div>
            </div>
          </div>
        ))}
      </div>
    </AppSkeleton>
  );
}
