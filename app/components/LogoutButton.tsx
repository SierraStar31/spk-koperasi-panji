import { IconLogout } from "./ui/Icons";

export function LogoutButton() {
  async function logoutAction() {
    "use server";
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("session");
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }

  return (
    <form action={logoutAction} className="w-full">
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-300/25 rounded-md text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-900/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b4d3e]"
      >
        <IconLogout className="w-4 h-4" /> Keluar
      </button>
    </form>
  );
}
