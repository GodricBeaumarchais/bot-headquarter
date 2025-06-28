import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';

export const data = new SlashCommandBuilder()
    .setName('signin')
    .setDescription('Créer votre compte et commencer avec 0 tokens');

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    try {
        // Créer un nouvel utilisateur
        const user = await DatabaseManager.createUser(
            interaction.user.id,
            interaction.user.username
        );
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Compte créé avec succès !')
            .setDescription(`Bienvenue **${interaction.user.username}** !`)
            .addFields(
                { name: '💰 Tokens de départ', value: '5 tokens', inline: true },
                { name: '🆔 ID Discord', value: interaction.user.id, inline: true },
                { name: '📅 Date de création', value: user.createdAt.toLocaleDateString('fr-FR'), inline: true }
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de la création du compte:', error);
        
        let errorMessage = '❌ Erreur lors de la création du compte';
        if (error instanceof Error) {
            if (error.message === 'Utilisateur déjà inscrit') {
                errorMessage = '❌ Vous avez déjà un compte ! Utilisez `/balance` pour voir votre solde.';
            }
        }
        
        await interaction.reply({
            content: errorMessage,
            ephemeral: true
        });
    }
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 
