import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types/Command';
import { Logger } from './logger';

export function withLogging(command: Command): Command {
    return {
        ...command,
        execute: async (interaction: ChatInputCommandInteraction) => {
            const startTime = Date.now();
            let success = false;
            let error = '';

            try {
                // Exécuter la commande originale
                await command.execute(interaction);
                success = true;
            } catch (err) {
                success = false;
                error = err instanceof Error ? err.message : 'Erreur inconnue';
                console.error(`Erreur dans la commande ${interaction.commandName}:`, err);
                
                // Répondre avec l'erreur si la commande n'a pas encore répondu
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Une erreur s\'est produite lors de l\'exécution de la commande.',
                        ephemeral: true
                    });
                }
            } finally {
                // Logger la commande
                const executionTime = Date.now() - startTime;
                await Logger.logCommand({
                    userId: interaction.user.id,
                    commandName: interaction.commandName,
                    commandType: 'slash',
                    channelId: interaction.channelId,
                    guildId: interaction.guildId || undefined,
                    args: interaction.options.data.map(option => ({
                        name: option.name,
                        value: option.value,
                        type: option.type
                    })),
                    success,
                    error: error || undefined,
                    executionTime
                });
            }
        }
    };
} 