export interface AuthenticatedUser {
  discordId: string;
  username: string;
  avatar?: string;
  discriminator?: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    discordId: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthenticatedUser;
}

export interface TokenVerificationResponse {
  valid: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

export interface DiscordAuthUrlResponse {
  authUrl: string;
} 