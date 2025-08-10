import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/Command';
import { signInBehavior } from '../../behaviors/money/signIn';

export const data = new SlashCommandBuilder()
    .setName('signin')
    .setDescription('Créer votre compte (0 Atmas de départ)');

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const result = await signInBehavior(interaction.user.id, interaction.user.username);
    
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