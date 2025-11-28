import { Suspense } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { SearchResults } from "@/components/search/SearchResults";
import { notFound } from "next/navigation";

export default function CedulaPage({
  params,
}: {
  params: { cedula: string };
}) {
  const { cedula } = params;

  // Validate cedula format (V or E followed by numbers)
  const cedulaRegex = /^[VE]\\d{6,8}$/i;
  if (!cedulaRegex.test(cedula)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1a2332]">
      {/* Header with Search Form */}
      <header className="py-6 px-4 border-b border-gray-700">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <a href="/">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                <span className="text-yellow-500">Fraude</span>
                <span className="text-white">Venezuela</span>
                <span className="text-yellow-500">.info</span>
              </h1>
            </a>
            <p className="text-gray-400 text-sm">
              Consulte Cédulas y Reporte Estafas
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          }
        >
          <SearchResults cedula={cedula} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-auto border-t border-gray-700">
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
