import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { exchangeBehavior } from '../../behaviors/admin/exchange';

export const data = new SlashCommandBuilder()
    .setName('exchange')
    .setDescription('Échanger des tokens entre deux utilisateurs (Admin uniquement)')
    .addUserOption(option =>
        option.setName('depuis')
            .setDescription('Utilisateur depuis qui transférer les tokens')
            .setRequired(true)
    )
    .addUserOption(option =>
        option.setName('vers')
            .setDescription('Utilisateur vers qui transférer les tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('montant')
            .setDescription('Montant de tokens à échanger')
            .setRequired(true)
            .setMinValue(1)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const fromUser = interaction.options.getUser('depuis', true);
    const toUser = interaction.options.getUser('vers', true);
    const amount = interaction.options.getInteger('montant', true);
    
    const result = await exchangeBehavior(
        interaction.user.id,
        fromUser.id,
        toUser.id,
        amount,
        interaction.user.username,
        fromUser.username,
        toUser.username
    );
    
    if (result.success && result.embed) {
        const embed = new EmbedBuilder()
            .setColor(result.embed.color)
            .setTitle(result.embed.title)
            .addFields(result.embed.fields)
            .setFooter(result.embed.footer)
            .setTimestamp();
        
        await interaction.reply({ 
            embeds: [embed],
            ephemeral: true 
        });
        
        // Notifier les utilisateurs
        try {
            await fromUser.send(`💰 **${amount} tokens** ont été transférés de votre compte vers ${toUser.username} par un administrateur !`);
        } catch (error) {
            // Ignorer si l'utilisateur a les DMs fermés
        }

        try {
            await toUser.send(`💰 **${amount} tokens** ont été transférés de ${fromUser.username} vers votre compte par un administrateur !`);
        } catch (error) {
            // Ignorer si l'utilisateur a les DMs fermés
        }
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
    category: 'admin'
} as Command; 