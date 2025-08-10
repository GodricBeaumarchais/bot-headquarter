import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/Command';
import { transferBehavior } from '../../behaviors/money/transfer';

export const data = new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transférer des tokens à un autre utilisateur')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Utilisateur à qui transférer les tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('montant')
            .setDescription('Montant de tokens à transférer')
            .setRequired(true)
            .setMinValue(1)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser('utilisateur', true);
    const amount = interaction.options.getInteger('montant', true);
    
    const result = await transferBehavior(
        interaction.user.id,
        targetUser.id,
        amount,
        interaction.user.username,
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