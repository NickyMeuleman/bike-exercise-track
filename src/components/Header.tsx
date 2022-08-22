import { PlusIcon } from "@heroicons/react/outline";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full flex-none bg-white/75 backdrop-blur transition-colors duration-500 border-b border-slate-900/10">
      <div className="container mx-auto">
        <div className="mx-4 border-b border-slate-900/10 py-4">
          <div className="relative flex items-center">
            <Link href="/">
              <a className="mr-3 flex-none overflow-hidden">Home</a>
            </Link>
            <nav className="relative ml-auto items-center text-sm font-semibold leading-6 text-slate-700">
              <ul className="flex space-x-8">
                <li>
                  <Link href="/add">
                    <a className="flex items-center justify-center gap-1 rounded-full border-2 border-green-700 bg-transparent py-2 px-3 text-base leading-normal text-green-700 outline-none hover:bg-green-700 hover:text-green-100 focus:ring-green-700 focus:ring-1 focus:ring-offset-2 active:ring-0 active:ring-offset-0">
                      <span className="font-semibold">Nieuwe rit</span>
                      <PlusIcon className="w-4 h-full"/>
                    </a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
