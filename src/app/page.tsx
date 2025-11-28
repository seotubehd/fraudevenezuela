import { SearchForm } from "@/components/search/SearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#3a4a63] text-white flex flex-col">
      {/* Header */}
      <header className="py-8 sm:py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-down">
            <span className="text-yellow-500">Fraude</span>
            <span className="text-white">Venezuela</span>
            <span className="text-yellow-500">.info</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 animate-fade-in-up">
            Consulte Cédulas y Reporte Estafas de forma rápida y segura.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-4 sm:pt-8">
        <div className="w-full max-w-2xl">
          <SearchForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 mt-auto">
        <div className="container mx-auto">
          <div className="bg-black/20 border border-yellow-400/20 rounded-lg p-6 mb-6 shadow-md">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-yellow-400 text-3xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-300 mb-1 text-center sm:text-left">Aviso Importante</h3>
                <p className="text-sm text-gray-300 text-center sm:text-left">
                  Los datos de identificación personal mostrados aquí son de dominio público
                  y accesibles a través de sitios web gubernamentales. Este sitio solo los
                  recopila y los muestra de forma centralizada para facilitar su consulta.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-400 text-xs">
            <p>© 2025 FraudeVenezuela.info - <a href="#" className="hover:text-gray-300 transition-colors">Contacto</a></p>
            <p className="mt-2">Esta es una herramienta comunitaria. La información es puramente referencial.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}