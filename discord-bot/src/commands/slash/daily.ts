import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/Command';
import { dailyBehavior } from '../../behaviors/money/daily';

export const data = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Récupérer votre récompense quotidienne');

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const result = await dailyBehavior(interaction.user.id);
    
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