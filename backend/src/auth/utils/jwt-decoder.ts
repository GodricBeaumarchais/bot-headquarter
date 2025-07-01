import { JwtPayload } from '../interfaces/discord-user.interface';

export class JwtDecoder {
  /**
   * Décode un JWT sans vérification (pour usage côté client)
   * @param token Le JWT à décoder
   * @returns Le payload décodé ou null si invalide
   */
  static decode(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Vérifie si un JWT est expiré
   * @param token Le JWT à vérifier
   * @returns true si expiré, false sinon
   */
  static isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Extrait les informations utilisateur d'un JWT
   * @param token Le JWT
   * @returns Les informations utilisateur ou null
   */
  static getUserInfo(token: string): Omit<JwtPayload, 'iat' | 'exp'> | null {
    const payload = this.decode(token);
    if (!payload) {
      return null;
    }

    const { iat, exp, ...userInfo } = payload;
    return userInfo;
  }
} 