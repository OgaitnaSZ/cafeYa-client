import { Mesa } from "./mesa.model";
import { User } from "./user.model";

export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

export interface MesaSession {
  mesa: Mesa;
  validatedAt: number;
  codigoExpiresAt: number;
}