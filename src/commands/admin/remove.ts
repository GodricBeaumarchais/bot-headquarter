import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { CURRENCY_NAME } from '../../utils/constants';

export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Retire des tokens d\'un utilisateur (Admin seulement)')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Utilisateur à qui retirer des tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('montant')
            .setDescription('Nombre de tokens à retirer')
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

        const targetUser = interaction.options.getUser('utilisateur');
        const amount = interaction.options.getInteger('montant');

        if (!targetUser || !amount) {
            await interaction.editReply({
                content: '❌ Paramètres manquants.'
            });
            return;
        }

        // Vérifier si l'utilisateur cible a un compte
        const user = await DatabaseManager.getUser(targetUser.id);
        if (!user) {
            await interaction.editReply({
                content: `❌ ${targetUser.username} n'a pas encore de compte.`
            });
            return;
        }

        // Vérifier si l'utilisateur a assez de tokens
        if (user.token < amount) {
            await interaction.editReply({
                content: `❌ ${targetUser.username} n'a que ${user.token} ${CURRENCY_NAME}. Impossible de retirer ${amount} ${CURRENCY_NAME}.`
            });
            return;
        }

        // Retirer les tokens
        const updatedUser = await DatabaseManager.removeTokens(targetUser.id, amount);

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('💰 Retrait de tokens réussi')
            .addFields(
                { 
                    name: '👤 Utilisateur', 
                    value: targetUser.username, 
                    inline: true 
                },
                { 
                    name: '➖ Tokens retirés', 
                    value: `${amount}`, 
                    inline: true 
                },
                { 
                    name: '💳 Nouveau solde', 
                    value: `${updatedUser.token} ${CURRENCY_NAME}`, 
                    inline: true 
                }
            )
            .setFooter({ 
                text: `Retiré par ${interaction.user.username}` 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        // Notifier l'utilisateur cible
        try {
            await targetUser.send({
                content: `💰 **${amount} ${CURRENCY_NAME}** ont été retirés de votre compte par un administrateur !`
            });
        } catch (error) {
            // Ignorer si l'utilisateur a les DMs fermés
        }

    } catch (error) {
        console.error('Erreur lors du retrait de tokens:', error);
        await interaction.editReply({
            content: '❌ Une erreur s\'est produite lors du retrait des tokens.'
        });
    }
}; 