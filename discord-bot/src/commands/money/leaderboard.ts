import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement des joueurs avec le plus de tokens')
    .addIntegerOption(option =>
        option.setName('limite')
            .setDescription('Nombre de joueurs à afficher (max 25)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(25)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const limit = interaction.options.getInteger('limite') || 10;
    
    try {
        const leaderboard = await DatabaseManager.getLeaderboard(limit);
        
        if (leaderboard.length === 0) {
            await interaction.reply({
                content: '📊 Aucun joueur trouvé dans le classement',
                ephemeral: true
            });
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('🏆 Classement des joueurs les plus riches')
            .setDescription('Voici les joueurs avec le plus de tokens')
            .setTimestamp();
        
        // Créer la liste des joueurs
        const leaderboardText = leaderboard.map((user: { username: string; token: number }, index: number) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} **${user.username}** - ${user.token} tokens`;
        }).join('\n');
        
        embed.addFields({
            name: '📊 Classement',
            value: leaderboardText,
            inline: false
        });
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de la récupération du classement:', error);
        await interaction.reply({
            content: '❌ Erreur lors de la récupération du classement',
            ephemeral: true
        });
    }
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 