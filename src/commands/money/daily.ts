import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { DAILY_REWARD, CURRENCY_NAME } from '../../utils/constants';

export const data = new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Récupérez votre récompense quotidienne de tokens');

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    try {
        // Vérifier que l'utilisateur a un compte
        const user = await DatabaseManager.getUser(interaction.user.id);
        
        if (!user) {
            await interaction.reply({
                content: '❌ Vous devez d\'abord créer un compte avec `!hq signin`',
                ephemeral: true
            });
            return;
        }
        
        // Gérer la récompense quotidienne avec streak
        const updatedUser = await DatabaseManager.handleDailyReward(interaction.user.id, DAILY_REWARD);
        
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('🎁 Récompense quotidienne')
            .setDescription(`Vous avez reçu **${DAILY_REWARD}** ${CURRENCY_NAME} !`)
            .addFields(
                { name: '💰 Gain', value: `${DAILY_REWARD} ${CURRENCY_NAME}`, inline: true },
                { name: '💳 Nouveau solde', value: `${updatedUser.token} ${CURRENCY_NAME}`, inline: true },
                { name: '🔥 Streak', value: `${updatedUser.streak} jours consécutifs`, inline: true },
                { name: '⏰ Prochaine récompense', value: 'Demain à 00:00', inline: true }
            )
            .setTimestamp();
        
        // Ajouter un champ spécial pour le bonus si applicable
        if (updatedUser.bonusMessage) {
            embed.addFields({
                name: '🎉 Bonus de streak !',
                value: `Streak: ${updatedUser.streak} jours\nCalcul: ${updatedUser.streak} ÷ 5 = ${Math.floor(updatedUser.streak / 5)} ${CURRENCY_NAME}\nBonus: ${updatedUser.bonusAmount} ${CURRENCY_NAME}`,
                inline: false
            });
        }
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de la récupération de la récompense:', error);
        
        let errorMessage = '❌ Erreur lors de la récupération de la récompense';
        if (error instanceof Error) {
            if (error.message === 'Récompense quotidienne déjà récupérée aujourd\'hui') {
                errorMessage = '❌ Vous avez déjà récupéré votre récompense quotidienne aujourd\'hui !';
            } else if (error.message === 'Utilisateur non trouvé') {
                errorMessage = '❌ Utilisateur non trouvé';
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
    category: 'money',
    cooldown: 86400 // 24 heures en secondes
} as Command; 