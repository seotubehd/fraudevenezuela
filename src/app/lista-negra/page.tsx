import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";
import Link from 'next/link';

interface ReportedPerson {
  cedula: string;
  nombreCompleto: string;
  reportCount: number;
}

async function getBlacklistData(): Promise<ReportedPerson[] | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/lista-negra`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to fetch data");
    }
    return await res.json();
  } catch (error: any) {
    console.error("[BlacklistPage] Error fetching data:", error);
    return null;
  }
}

export default async function ListaNegraPage() {
  const data = await getBlacklistData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Lista Negra de Reportados</h1>
            <p className="mt-2 text-lg text-gray-400">
              Personas con múltiples reportes verificados por la comunidad.
            </p>
          </div>

          <div className="bg-[#8b6914] p-4 rounded-md border border-[#a17817] text-white my-8 flex items-start gap-4">
            <ShieldAlert className="h-6 w-6 text-yellow-300 flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-semibold text-lg">Mostrando los 10 con más reportes</h2>
              <p className="text-sm text-yellow-100">
                Esta lista muestra las personas con el mayor número de incidencias verificadas. La información es dinámica y se actualiza constantemente.
              </p>
            </div>
          </div>

          {data === null && (
            <div className="text-center py-12">
              <p className="text-red-500 font-medium">Ocurrió un error al cargar los datos. Por favor, inténtalo de nuevo en unos minutos.</p>
            </div>
          )}

          {data && data.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay personas en la lista negra por el momento.</p>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="border border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-800 hover:bg-gray-800/90 border-b-gray-700">
                      <TableHead className="w-[150px] font-medium text-gray-300">Cédula</TableHead>
                      <TableHead className="font-medium text-gray-300">Nombre Completo</TableHead>
                      <TableHead className="text-right font-medium text-gray-300">Cantidad de Reportes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((person) => (
                      <TableRow key={person.cedula} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-mono text-sm text-gray-400">{person.cedula}</TableCell>
                        <TableCell className="font-medium text-white">{person.nombreCompleto}</TableCell>
                        <TableCell className="text-right font-bold text-lg text-red-500">{person.reportCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="w-full text-center p-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Cédula de Identidad. Todos los derechos reservados.</p>
        <p>Si tienes alguna duda, contáctanos a <a href="mailto:info@ceduladeidentidad.xyz" className="underline hover:text-gray-400">info@ceduladeidentidad.xyz</a>.</p>
      </footer>
    </div>
  );
}

// Force dynamic rendering to ensure the page is always up-to-date
export const dynamic = 'force-dynamic';
