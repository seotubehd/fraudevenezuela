import { getCedula, getReportsByCedula } from "@/lib/services/cedula";
import { notFound } from "next/navigation";
import { SearchResultsClient } from "./SearchResultsClient";
import type { Report as OriginalReport } from "@/lib/services/cedula";
import { Timestamp } from "firebase/firestore";

interface SearchResultsProps {
    cedula: string;
}

// Tipo para los reportes que vienen de Firestore con el objeto Timestamp
interface ReportWithTimestamp extends Omit<OriginalReport, 'createdAt'> {
    createdAt: Timestamp;
}

// ¡NUEVO! Tipo para los reportes que se envían al cliente, con la fecha como string.
export interface ClientReport extends Omit<OriginalReport, 'createdAt'> {
    createdAt: string;
}

export async function SearchResults({ cedula }: SearchResultsProps) {
    const formattedCedula = cedula.includes('-') 
        ? cedula 
        : `${cedula.charAt(0)}-${cedula.slice(1)}`;

    const [cedulaResult, reportsResult] = await Promise.all([
        getCedula(formattedCedula),
        getReportsByCedula(formattedCedula),
    ]);

    if (!cedulaResult) {
        notFound();
    }
    
    // Usamos el tipo con Timestamp para ordenar
    const sortedReports = (reportsResult as ReportWithTimestamp[]).sort((a, b) => {
        return b.createdAt.seconds - a.createdAt.seconds;
    });

    // Serializamos a 'ClientReport', convirtiendo el Timestamp a un string ISO.
    const serializableReports: ClientReport[] = sortedReports.map(report => ({
        ...report,
        // Conversión explícita a string ISO
        createdAt: new Date(report.createdAt.seconds * 1000).toISOString(),
    }));

    return (
        <SearchResultsClient 
            cedula={cedula} 
            initialData={cedulaResult} 
            initialReports={serializableReports} // Ahora pasamos el tipo correcto
        />
    );
}
