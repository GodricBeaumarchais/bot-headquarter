import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { generateBehavior } from '../../behaviors/admin/generate';

export const data = new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Générer des tokens pour un utilisateur (Admin uniquement)')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Utilisateur pour qui générer des tokens')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('montant')
            .setDescription('Montant de tokens à générer')
            .setRequired(true)
            .setMinValue(1)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const targetUser = interaction.options.getUser('utilisateur', true);
    const amount = interaction.options.getInteger('montant', true);
    
    const result = await generateBehavior(
        interaction.user.id,
        targetUser.id,
        amount,
        interaction.user.username,
        targetUser.username
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
        
        // Notifier l'utilisateur cible
        try {
            await targetUser.send(`💰 **${amount} tokens** ont été générés dans votre compte par un administrateur !`);
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