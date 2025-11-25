export type ReportStatus = 'pendiente' | 'aprobado' | 'denegado';

export interface Report {
  id: string;
  cedula: string;
  descripcion: string;
  evidencia: string[]; // URLs de las imágenes
  fechaCreacion: any; // Firestore Timestamp
  estado: ReportStatus;
}