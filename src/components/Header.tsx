import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 bg-white">
      <div className="container mx-auto">
        <div className="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 mx-4 lg:mx-0">
          <div className="relative flex items-center">
            <Link href="/">
              <a className="mr-3 flex-none overflow-hidden md:w-auto">Home</a>
            </Link>
            <nav className="relative lg:flex items-center ml-auto text-sm leading-6 font-semibold text-slate-700">
              <ul className="flex space-x-8">
                <li>
                  <Link href="/add">
                    <a className="hover:text-sky-500">Add</a>
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
