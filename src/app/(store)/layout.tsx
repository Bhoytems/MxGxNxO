import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 bg-white">
        <div className="container flex flex-col items-center gap-2 py-10 text-sm text-gray-500 sm:flex-row sm:justify-between">
          <p className="font-display font-semibold text-gray-900">
            Magnif<span className="text-primary-600">ico</span>
          </p>
          <p>© {new Date().getFullYear()} Magnifico. Shipped from suppliers worldwide.</p>
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
