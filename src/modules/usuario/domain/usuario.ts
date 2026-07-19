export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
