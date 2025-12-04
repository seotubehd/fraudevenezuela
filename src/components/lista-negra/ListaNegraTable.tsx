// src/components/lista-negra/ListaNegraTable.tsx

import { ReportedPerson } from "@/lib/services/lista-negra";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface ListaNegraTableProps {
  people: ReportedPerson[];
}

export function ListaNegraTable({ people }: ListaNegraTableProps) {
  return (
    <div className="bg-black/20 border border-yellow-400/20 rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-yellow-400/20">
            <TableHead className="text-yellow-300">Cédula</TableHead>
            {/* Hide Nombre Completo on small screens (e.g., mobile) */}
            <TableHead className="text-yellow-300 hidden sm:table-cell">Nombre Completo</TableHead>
            <TableHead className="text-yellow-300 text-center">Reportes</TableHead>
            <TableHead className="text-yellow-300"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.cedula} className="border-b-transparent hover:bg-white/5">
              <TableCell className="font-medium">{person.cedula}</TableCell>
              {/* Hide Nombre Completo on small screens */}
              <TableCell className="hidden sm:table-cell">{person.nombreCompleto}</TableCell>
              <TableCell className="text-center">{person.reportCount}</TableCell>
              <TableCell className="text-right">
                <Link href={`/${person.cedula.replace('-', '')}`} className="text-yellow-400 hover:underline">
                  Ver Detalles
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
