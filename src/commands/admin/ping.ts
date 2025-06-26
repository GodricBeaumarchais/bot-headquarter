import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot');

export const execute: Command['execute'] = async (interaction: ChatInputCommandInteraction) => {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🏓 Pong!')
        .addFields(
            { name: 'Latence', value: `${latency}ms`, inline: true },
            { name: 'API Latence', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
        )
        .setTimestamp();
    
    await interaction.editReply({ content: '', embeds: [embed] });
};

export default {
    data,
    execute,
    category: 'admin'
} as Command; 