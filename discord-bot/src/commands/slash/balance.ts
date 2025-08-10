import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { balanceBehavior } from '../../behaviors/money/balance';

export const data = new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Affiche votre solde de tokens')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Utilisateur dont vous voulez voir le solde')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    const result = await balanceBehavior(
        interaction.user.id, 
        targetUser.id, 
        targetUser.username
    );
    
    if (result.success && result.user) {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💰 Solde de tokens')
            .setDescription(`${targetUser.username} a **${result.user.token}** tokens`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    } else {
        await interaction.reply({
            content: result.message,
            ephemeral: true
        });
    }
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 