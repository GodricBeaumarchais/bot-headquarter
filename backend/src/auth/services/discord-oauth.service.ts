import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscordUser, DiscordTokenResponse } from '../interfaces/discord-user.interface';

@Injectable()
export class DiscordOAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.clientId = this.configService.get<string>('DISCORD_CLIENT_ID') || '';
        this.clientSecret = this.configService.get<string>('DISCORD_CLIENT_SECRET') || '';
        this.redirectUri = this.configService.get<string>('DISCORD_REDIRECT_URI') || '';

        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            throw new Error('Variables d\'environnement Discord manquantes. Vérifiez DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET et DISCORD_REDIRECT_URI');
        }
    }

    getAuthUrl(): string {
        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('response_type', 'code');
        params.append('redirect_uri', this.redirectUri);
        params.append('scope', 'identify email');

        return `https://discord.com/oauth2/authorize?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
        try {
            const formData = new URLSearchParams();
            formData.append('client_id', this.clientId);
            formData.append('client_secret', this.clientSecret);
            formData.append('grant_type', 'authorization_code');
            formData.append('code', code);
            formData.append('redirect_uri', this.redirectUri);

            const response = await axios.post('https://discord.com/api/oauth2/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            return response.data;
        } catch (error) {
            console.error('Erreur Discord OAuth2:', error.response?.data || error.message);
            throw new UnauthorizedException('Échec de l\'échange du code d\'autorisation');
        }
    }

    async getUserInfo(accessToken: string): Promise<DiscordUser> {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data;
        } catch (error) {
            throw new UnauthorizedException('Impossible de récupérer les informations utilisateur');
        }
    }

    async findOrUpdateUser(discordUser: DiscordUser) {
        const existingUser = await this.prisma.user.findUnique({
            where: { discordId: discordUser.id },
            include: { role: true },
        });

        if (!existingUser) {
            throw new UnauthorizedException('Utilisateur non trouvé dans la base de données');
        }

        // Mettre à jour les informations de profil
        const updateData: any = {
            username: discordUser.username,
        };

        // Ajouter les champs optionnels seulement s'ils existent
        if (discordUser.avatar !== undefined) {
            updateData.avatar = discordUser.avatar;
        }
        if (discordUser.discriminator !== undefined) {
            updateData.discriminator = discordUser.discriminator;
        }

        const updatedUser = await this.prisma.user.update({
            where: { discordId: discordUser.id },
            data: updateData,
            include: { role: true },
        });

        return updatedUser;
    }
} 