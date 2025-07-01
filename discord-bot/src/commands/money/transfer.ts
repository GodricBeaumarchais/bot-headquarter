import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';

export const data = new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transférer des tokens à un autre utilisateur')
    .addUserOption(option =>
        option.setName('destinataire')
            .setDescription('Utilisateur qui recevra les tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('montant')
            .setDescription('Montant de tokens à transférer')
            .setRequired(true)
            .setMinValue(1)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const recipient = interaction.options.getUser('destinataire');
    const amount = interaction.options.getInteger('montant')!;
    
    if (recipient?.id === interaction.user.id) {
        await interaction.reply({
            content: '❌ Vous ne pouvez pas vous transférer des tokens à vous-même !',
            ephemeral: true
        });
        return;
    }
    
    try {
        // Vérifier que les deux utilisateurs ont des comptes
        const fromUser = await DatabaseManager.getUser(interaction.user.id);
        const toUser = await DatabaseManager.getUser(recipient!.id);
        
        if (!fromUser) {
            await interaction.reply({
                content: '❌ Vous devez d\'abord créer un compte avec `!hq signin`',
                ephemeral: true
            });
            return;
        }
        
        if (!toUser) {
            await interaction.reply({
                content: '❌ Le destinataire doit d\'abord créer un compte avec `!hq signin`',
                ephemeral: true
            });
            return;
        }
        
        // Effectuer le transfert
        const result = await DatabaseManager.transferTokens(
            interaction.user.id,
            recipient!.id,
            amount
        );
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💸 Transfert effectué')
            .setDescription(`Vous avez transféré **${amount}** tokens à ${recipient!.username}`)
            .addFields(
                { name: '💰 Montant', value: `${amount} tokens`, inline: true },
                { name: '👤 Destinataire', value: recipient!.username, inline: true },
                { name: '💳 Votre nouveau solde', value: `${result.from.token} tokens`, inline: true }
            )
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors du transfert:', error);
        
        let errorMessage = '❌ Erreur lors du transfert';
        if (error instanceof Error) {
            if (error.message === 'Solde insuffisant') {
                errorMessage = '❌ Solde insuffisant pour effectuer ce transfert';
            } else if (error.message === 'Un des utilisateurs n\'existe pas') {
                errorMessage = '❌ Un des utilisateurs n\'existe pas';
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