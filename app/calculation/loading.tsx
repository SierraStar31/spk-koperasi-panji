import { AppSkeleton } from "@/app/components/AppSkeleton";

export default function Loading() {
  return (
    <AppSkeleton>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-stone-200 rounded w-64"></div>
          <div className="h-4 bg-stone-100 rounded w-80"></div>
        </div>
        <div className="h-10 bg-[#1b4d3e]/20 rounded w-40"></div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-stone-200 rounded w-48"></div>
          <div className="h-8 bg-stone-100 rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-stone-50 border border-stone-100 rounded-lg flex items-center justify-between px-6">
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded w-36"></div>
                <div className="h-3 bg-stone-100 rounded w-24"></div>
              </div>
              <div className="h-6 bg-stone-200 rounded w-28"></div>
            </div>
          ))}
        </div>
      </div>
    </AppSkeleton>
  );
}
