import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { ootdBehavior } from '../../behaviors/fun/ootd';

export const data = new SlashCommandBuilder()
    .setName('ootd')
    .setDescription('Affiche vos statistiques OOTD')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Utilisateur dont vous voulez voir les stats OOTD (optionnel)')
            .setRequired(false)
    );

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    const result = await ootdBehavior(
        interaction.user.id,
        targetUser.id,
        targetUser.username
    );

    if (result.success && result.embed) {
        const embed = new EmbedBuilder()
            .setColor(result.embed.color)
            .setTitle(result.embed.title)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(result.embed.fields)
            .setFooter(result.embed.footer)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    } else {
        await interaction.editReply({
            content: result.message
        });
    }
};

export default {
    data,
    execute,
    category: 'fun'
} as Command; 