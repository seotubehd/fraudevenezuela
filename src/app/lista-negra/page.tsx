'use client';

import { useState, useEffect } from 'react';
import type { ReportedPerson } from "@/lib/services/lista-negra";
import { ListaNegraTable } from "@/components/lista-negra/ListaNegraTable";
import { Button } from '@/components/ui/button';

export default function ListaNegraPage() {
  const [paginatedPeople, setPaginatedPeople] = useState<ReportedPerson[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/lista-negra?page=${currentPage}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { people, totalPages } = await response.json();
        setPaginatedPeople(people);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Failed to load reported people:", error);
        setPaginatedPeople([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [currentPage]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#3a4a63] text-white flex flex-col">
      <header className="py-8 sm:py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-down">
            <span className="text-red-500">Lista Negra</span>
            <span className="text-white"> de Estafadores</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 animate-fade-in-up">
            Personas con el mayor número de reportes de estafa en Venezuela.
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pt-4 sm:pt-8">
        <div className="w-full max-w-4xl">
          {isLoading && paginatedPeople.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Cargando reportes...</div>
          ) : paginatedPeople.length > 0 ? (
            <>
              <ListaNegraTable people={paginatedPeople} />
              {totalPages > 1 && (
                // Reverted to simple horizontal layout for all screen sizes
                <div className="flex justify-between items-center mt-6">
                  <Button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1 || isLoading}
                    className="bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  <span className="text-gray-300">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages || isLoading}
                    className="bg-yellow-400 text-black hover:bg-yellow-500 disabled:opacity-50"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-10">
              <p>No hay personas reportadas por el momento.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 sm:py-8 px-4 mt-auto">
        <div className="container mx-auto text-center text-gray-400 text-xs">
          <p>© 2025 FraudeVenezuela.info - <a href="#" className="hover:text-gray-300 transition-colors">Contacto</a></p>
        </div>
      </footer>
    </div>
  );
}
