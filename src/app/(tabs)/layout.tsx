import { TabBar } from "@/components/TabBar";

/** Shared shell: centered phone-width column (like Coy's .sheet) plus a bottom tab bar. */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pt-[env(safe-area-inset-top)] pb-[calc(64px+env(safe-area-inset-bottom)+24px)]">
        {children}
      </div>
      <TabBar />
    </>
  );
}
