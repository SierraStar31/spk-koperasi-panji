import { AppSkeleton } from "@/app/components/AppSkeleton";

export default function Loading() {
  return (
    <AppSkeleton>
      <div className="h-44 bg-teal-800/10 rounded-2xl p-8 space-y-4">
        <div className="h-6 bg-teal-900/15 rounded w-32"></div>
        <div className="h-8 bg-teal-900/15 rounded w-3/4"></div>
        <div className="h-4 bg-teal-900/15 rounded w-1/2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <div className="h-5 bg-stone-200 rounded w-1/3"></div>
            <div className="h-10 bg-stone-200 rounded w-1/4"></div>
            <div className="h-10 bg-stone-100 rounded w-full"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <div className="h-5 bg-stone-200 rounded w-1/2"></div>
            <div className="h-4 bg-stone-100 rounded w-full"></div>
            <div className="h-4 bg-stone-100 rounded w-2/3"></div>
            <div className="h-10 bg-stone-200 rounded w-full mt-6"></div>
          </div>
        ))}
      </div>
    </AppSkeleton>
  );
}
