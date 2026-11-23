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
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#e6e2dc] rounded-lg text-xs font-medium text-[#ca3939] bg-white hover:bg-[#f7f5f0] shadow-2xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1b4d3e] focus:ring-offset-1"
      >
        <IconLogout className="w-4 h-4 text-[#ca3939]" /> Keluar
      </button>
    </form>
  );
}
