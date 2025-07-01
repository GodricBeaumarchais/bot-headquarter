import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';

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
    
    try {
        // Récupérer l'utilisateur dans la base
        const user = await DatabaseManager.getUser(targetUser.id);
        
        if (!user) {
            await interaction.reply({
                content: '❌ Cet utilisateur n\'a pas encore de compte. Utilisez `!hq signin` pour créer un compte.',
                ephemeral: true
            });
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💰 Solde de tokens')
            .setDescription(`${targetUser.username} a **${user.token}** tokens`)
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de la récupération du solde:', error);
        await interaction.reply({
            content: '❌ Erreur lors de la récupération du solde',
            ephemeral: true
        });
    }
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 