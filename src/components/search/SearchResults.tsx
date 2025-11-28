import { getCedula, getReportsByCedula } from "@/lib/services/cedula";
import { notFound } from "next/navigation";
import { SearchResultsClient } from "./SearchResultsClient";

interface SearchResultsProps {
    cedula: string;
}

export async function SearchResults({ cedula }: SearchResultsProps) {
    console.log(`\n--- NUEVA BÚSQUEDA EN SERVIDOR ---`);
    console.log(`[SearchResults] 1. Componente renderizado para la cédula: ${cedula}`);

    const formattedCedula = cedula.includes('-') 
        ? cedula 
        : `${cedula.charAt(0)}-${cedula.slice(1)}`;

    console.log(`[SearchResults] 2. Cédula formateada para la API: ${formattedCedula}`);
    console.log(`[SearchResults] 3. Ejecutando Promise.all para getCedula y getReportsByCedula...`);

    const [cedulaResult, reportsResult] = await Promise.all([
        getCedula(formattedCedula),
        getReportsByCedula(formattedCedula)
    ]);

    console.log(`[SearchResults] 4. Promise.all completado.`);
    console.log(`[SearchResults]    - Resultado de getCedula:`, cedulaResult ? `OBJECT { nombre: "${cedulaResult.nombre}" }` : `--> NULL <--`);
    console.log(`[SearchResults]    - Número de reportes encontrados: ${reportsResult.length}`);

    if (!cedulaResult) {
        console.error(`[SearchResults] 5. ¡ERROR FATAL! El resultado de getCedula es NULL. Llamando a notFound()...`);
        console.log(`------------------------------------\n`);
        notFound();
    }

    console.log(`[SearchResults] 5. El resultado de getCedula es VÁLIDO.`);
    const sortedReports = reportsResult.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    console.log(`[SearchResults] 6. Reportes ordenados. Pasando datos al componente cliente SearchResultsClient.`);
    console.log(`------------------------------------\n`);

    return (
        <SearchResultsClient 
            cedula={cedula} 
            initialData={cedulaResult} 
            initialReports={sortedReports} 
        />
    );
}
