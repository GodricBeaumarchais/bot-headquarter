import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DiscordOAuthService } from '../services/discord-oauth.service';
import { JwtAuthService } from '../services/jwt.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly discordOAuthService: DiscordOAuthService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  @Get('discord')
  getDiscordAuthUrl(@Res() res: Response) {
    const authUrl = this.discordOAuthService.getAuthUrl();
    res.redirect(authUrl);
  }

  @Get('discord/debug')
  debugDiscordConfig() {
    const authUrl = this.discordOAuthService.getAuthUrl();
    return {
      clientId: process.env.DISCORD_CLIENT_ID,
      redirectUri: process.env.DISCORD_REDIRECT_URI,
      generatedUrl: authUrl,
      redirectUriInUrl: new URL(authUrl).searchParams.get('redirect_uri'),
      expectedUrl: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI || '')}&response_type=code&scope=identify%20email`,
      instructions: [
        "1. Copiez l'URL 'redirectUriInUrl' ci-dessus",
        "2. Allez sur https://discord.com/developers/applications",
        "3. Sélectionnez votre application",
        "4. Onglet 'OAuth2'",
        "5. Section 'Redirects'",
        "6. Ajoutez exactement cette URL: " + process.env.DISCORD_REDIRECT_URI
      ]
    };
  }

  @Get('discord/callback')
  async handleDiscordCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      // Échanger le code contre un token d'accès
      const tokenResponse = await this.discordOAuthService.exchangeCodeForToken(code);
      
      // Récupérer les informations utilisateur
      const discordUser = await this.discordOAuthService.getUserInfo(tokenResponse.access_token);
      
      // Trouver ou mettre à jour l'utilisateur dans la base de données
      const user = await this.discordOAuthService.findOrUpdateUser(discordUser);
      
      // Générer le JWT
      const jwtPayload = {
        sub: user.discordId,
        username: user.username,
        avatar: user.avatar || undefined,
        discriminator: user.discriminator || undefined,
        role: user.role,
      };
      
      const token = this.jwtAuthService.generateToken(jwtPayload);
      
      // Rediriger vers le frontend avec le token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  @Get('verify')
  async verifyToken(@Query('token') token: string) {
    try {
      const payload = this.jwtAuthService.verifyToken(token);
      return {
        valid: true,
        user: payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  @Get('discord/test')
  testDiscordAuth() {
    const params = new URLSearchParams();
    params.append('client_id', process.env.DISCORD_CLIENT_ID || '');
    params.append('response_type', 'code');
    params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/discord/callback');
    params.append('scope', 'identify email');

    const testUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    
    return {
      testUrl,
      instructions: [
        "1. Copiez cette URL et testez-la dans votre navigateur",
        "2. Si elle fonctionne, le problème vient de la configuration Discord",
        "3. Si elle ne fonctionne pas, vérifiez les redirects dans Discord Developer Portal"
      ]
    };
  }
} 