export function Footer() {
  return (
    <footer className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 bg-white">
      <div className="container mx-auto">
        <div className="py-4 border-t border-slate-900/10 lg:px-8 lg:border-0 mx-4 lg:mx-0">
          <small>
            Gemaakt door <a href="https://twitter.com/NMeuleman" className="underline decoration-green-600 hover:text-green-800">Nicky Meuleman</a>
          </small>
        </div>
      </div>
    </footer>
  );
}
