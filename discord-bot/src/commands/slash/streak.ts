import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/Command';
import { streakBehavior } from '../../behaviors/money/streak';

export const data = new SlashCommandBuilder()
    .setName('streak')
    .setDescription('Affiche votre streak quotidien')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Utilisateur dont vous voulez voir le streak')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    const result = await streakBehavior(
        interaction.user.id,
        targetUser.id,
        targetUser.username
    );
    
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