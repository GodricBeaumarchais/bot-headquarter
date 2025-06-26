import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export const data = new SlashCommandBuilder()
    .setName('streak')
    .setDescription('Affiche votre streak de connexion quotidienne')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Utilisateur dont vous voulez voir le streak')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    try {
        // Récupérer l'utilisateur dans la base
        const user = await DatabaseManager.getUser(targetUser.id);
        
        if (!user) {
            await interaction.reply({
                content: '❌ Cet utilisateur n\'a pas encore de compte. Utilisez `/signin` pour créer un compte.',
                ephemeral: true
            });
            return;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#ff6b35')
            .setTitle('🔥 Streak de connexion')
            .setDescription(`${targetUser.username} a un streak de **${user.streak} jours**`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '🔥 Streak actuel', value: `${user.streak} jours consécutifs`, inline: true },
                { name: '💰 Solde total', value: `${user.token} ${CURRENCY_NAME}`, inline: true }
            )
            .setTimestamp();
        
        // Ajouter des informations sur la dernière récompense
        if (user.lastDailyDate) {
            const lastDaily = new Date(user.lastDailyDate);
            const now = new Date();
            const diffTime = now.getTime() - lastDaily.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let nextRewardText = '';
            if (diffDays === 0) {
                nextRewardText = 'Aujourd\'hui (déjà récupéré)';
            } else if (diffDays === 1) {
                nextRewardText = 'Demain (streak maintenu)';
            } else {
                nextRewardText = 'Demain (streak reset)';
            }
            
            embed.addFields(
                { name: '📅 Dernière récompense', value: lastDaily.toLocaleDateString('fr-FR'), inline: true },
                { name: '⏰ Prochaine récompense', value: nextRewardText, inline: true }
            );
        } else {
            embed.addFields(
                { name: '📅 Dernière récompense', value: 'Jamais', inline: true },
                { name: '⏰ Prochaine récompense', value: 'Maintenant !', inline: true }
            );
        }
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de la récupération du streak:', error);
        await interaction.reply({
            content: '❌ Erreur lors de la récupération du streak',
            ephemeral: true
        });
    }
};

export default {
    data,
    execute,
    category: 'money'
} as Command; 