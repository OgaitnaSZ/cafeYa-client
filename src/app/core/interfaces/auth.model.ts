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

/**
 * ToDo:
 * - Login Usuario
 * - Login Mesa
 *     - Controlar Codigo de mesa periodicamente, si expira, eliminar la sesión de la mesa
 * 
 * - Flujo:
 *   - Usuario escanea QR de la mesa (Se guarda en LocalStorage el ID de la mesa (no se borra almenos que vuelva a escanear otro QR))
 *       - Cuando el usuario accede a /validate controla si el ID de la URL coincide con el guardado
 *           - Si coincide, valida el codigo guardado, si es valido redirige al login, sino, pide el nuevo codigo de la mesa
 *           - Si no coincide, pide el codigo del nuevo ID de la mesa
 * 
 *   - Si el codigo es valido, se guarda la sesión de la mesa (mesa_id, validatedAt, codigoExpiresAt)
 * 
 *   - Redirige al login
 *       - Si el usuario tiene session activa, redirige al home
 *       - Si no, debe iniciar sesion con nombre (email y telefono opcional)
 * 
 *   - Se guarda la session del usuario (token, user) en LocalStorage
 *   - El usuario puede cerrar sesión para cambiar de nombre, email y telefono
 * 
 *   - En el home, se muestra el nombre del usuario y el numero de la mesa (si tiene sesión activa)
 */