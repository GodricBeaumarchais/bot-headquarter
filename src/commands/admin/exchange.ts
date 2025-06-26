import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export const data = new SlashCommandBuilder()
    .setName('exchange')
    .setDescription('Échange des tokens entre deux utilisateurs (Admin seulement)')
    .addUserOption(option =>
        option
            .setName('depuis')
            .setDescription('Utilisateur qui donne les tokens')
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName('vers')
            .setDescription('Utilisateur qui reçoit les tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('montant')
            .setDescription('Nombre de tokens à échanger')
            .setRequired(true)
            .setMinValue(1)
    );

export const execute: Command['execute'] = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
        // Vérifier si l'utilisateur est admin
        const isAdmin = await DatabaseManager.isAdmin(interaction.user.id);
        if (!isAdmin) {
            await interaction.editReply({
                content: '❌ Vous n\'avez pas les permissions pour utiliser cette commande.'
            });
            return;
        }

        const fromUser = interaction.options.getUser('depuis');
        const toUser = interaction.options.getUser('vers');
        const amount = interaction.options.getInteger('montant');

        if (!fromUser || !toUser || !amount) {
            await interaction.editReply({
                content: '❌ Paramètres manquants.'
            });
            return;
        }

        // Vérifier que ce ne sont pas les mêmes utilisateurs
        if (fromUser.id === toUser.id) {
            await interaction.editReply({
                content: '❌ Impossible d\'échanger des tokens avec soi-même.'
            });
            return;
        }

        // Vérifier si les utilisateurs ont des comptes
        const fromUserData = await DatabaseManager.getUser(fromUser.id);
        const toUserData = await DatabaseManager.getUser(toUser.id);

        if (!fromUserData) {
            await interaction.editReply({
                content: `❌ ${fromUser.username} n'a pas encore de compte.`
            });
            return;
        }

        if (!toUserData) {
            await interaction.editReply({
                content: `❌ ${toUser.username} n'a pas encore de compte.`
            });
            return;
        }

        // Vérifier si l'utilisateur source a assez de tokens
        if (fromUserData.token < amount) {
            await interaction.editReply({
                content: `❌ ${fromUser.username} n'a que ${fromUserData.token} ${CURRENCY_NAME}. Impossible d'échanger ${amount} ${CURRENCY_NAME}.`
            });
            return;
        }

        // Échanger les tokens
        const result = await DatabaseManager.exchangeTokens(fromUser.id, toUser.id, amount);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('💰 Échange de tokens réussi')
            .addFields(
                { 
                    name: '👤 De', 
                    value: `${fromUser.username} (${result.fromUser.token} ${CURRENCY_NAME})`, 
                    inline: true 
                },
                { 
                    name: '👤 Vers', 
                    value: `${toUser.username} (${result.toUser.token} ${CURRENCY_NAME})`, 
                    inline: true 
                },
                { 
                    name: '💰 Montant échangé', 
                    value: `${amount} ${CURRENCY_NAME}`, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Échangé par ${interaction.user.username}` 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Notifier les utilisateurs
        try {
            await fromUser.send({
                content: `💰 **${amount} ${CURRENCY_NAME}** ont été transférés de votre compte vers ${toUser.username} par un administrateur !`
            });
        } catch (error) {
            // Ignorer si l'utilisateur a les DMs fermés
        }

        try {
            await toUser.send({
                content: `💰 **${amount} ${CURRENCY_NAME}** ont été transférés de ${fromUser.username} vers votre compte par un administrateur !`
            });
        } catch (error) {
            // Ignorer si l'utilisateur a les DMs fermés
        }

    } catch (error) {
        console.error('Erreur lors de l\'échange de tokens:', error);
        await interaction.editReply({
            content: '❌ Une erreur s\'est produite lors de l\'échange des tokens.'
        });
    }
}; 