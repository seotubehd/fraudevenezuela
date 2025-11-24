import { SearchForm } from "@/components/search/SearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1a2332] flex flex-col">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="text-[#f59e0b]">Fraude</span>
            <span className="text-white">Venezuela</span>
            <span className="text-[#f59e0b]">.info</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Consulte Cédulas y Reporte Estafas
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-12">
        <div className="w-full max-w-2xl">
          <SearchForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="bg-[#8b6914] border border-[#a17817] rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⚠</span>
              <p className="text-sm text-gray-200">
                Los datos de identificación personal mostrados aquí son de dominio público
                y accesibles a través de sitios web gubernamentales. Este sitio solo los
                recopila y los muestra de forma centralizada.
              </p>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs">
            <p>© 2025 FraudeVenezuela.info - <a href="#" className="hover:text-gray-400">Contacto</a></p>
            <p className="mt-1">Esta es una herramienta comunitaria. La información es referencial.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
