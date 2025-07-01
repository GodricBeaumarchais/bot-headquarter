export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  email?: string;
  verified?: boolean;
  locale?: string;
  mfa_enabled?: boolean;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface JwtPayload {
  sub: string; // discordId
  username: string;
  avatar?: string;
  discriminator?: string;
  roleId: string;
  iat?: number;
  exp?: number;
} 