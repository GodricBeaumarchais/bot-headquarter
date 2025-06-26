import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export const data = new SlashCommandBuilder()
    .setName('ootd')
    .setDescription('Affiche vos statistiques OOTD')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Utilisateur dont vous voulez voir les stats OOTD (optionnel)')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction) => {
    await interaction.deferReply();

    try {
        const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
        
        // Vérifier si l'utilisateur a un compte
        const user = await DatabaseManager.getUser(targetUser.id);
        if (!user) {
            await interaction.reply({
                content: `❌ ${targetUser.username} n'a pas encore de compte. Utilisez \`!hq signin\` pour créer un compte.`,
                ephemeral: true
            });
            return;
        }

        // Récupérer les statistiques OOTD
        const stats = await DatabaseManager.getOOTDStats(targetUser.id);

        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle(`👗 Statistiques OOTD de ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { 
                    name: '📸 Messages OOTD créés', 
                    value: `${stats.messagesCreated}`, 
                    inline: true 
                },
                { 
                    name: '👍 Réactions données', 
                    value: `${stats.reactionsGiven}`, 
                    inline: true 
                },
                { 
                    name: `💰 ${CURRENCY_NAME} gagnés via OOTD`, 
                    value: `${stats.totalEarned}`, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: 'Postez vos tenues dans le salon OOTD et réagissez aux autres !' 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Erreur lors de la récupération des stats OOTD:', error);
        await interaction.editReply({
            content: '❌ Une erreur s\'est produite lors de la récupération des statistiques OOTD.'
        });
    }
}; 