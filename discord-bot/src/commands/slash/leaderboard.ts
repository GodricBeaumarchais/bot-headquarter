import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/Command';
import { leaderboardBehavior } from '../../behaviors/money/leaderboard';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement des joueurs les plus riches')
    .addIntegerOption(option =>
        option.setName('limite')
            .setDescription('Nombre de joueurs à afficher (défaut: 10)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(50)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const limit = interaction.options.getInteger('limite') || 10;
    
    const result = await leaderboardBehavior(limit);
    
    await interaction.reply({
        content: result.message,
        ephemeral: false
    });
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 