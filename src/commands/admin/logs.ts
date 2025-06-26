import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/Command';
import { DatabaseManager } from '../../utils/database';
import { Logger } from '../../utils/logger';

export const data = new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Gestion des logs du bot (Admin seulement)')
    .addSubcommand(subcommand =>
        subcommand
            .setName('stats')
            .setDescription('Affiche les statistiques des logs')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('commands')
            .setDescription('Affiche les logs de commandes')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('Utilisateur dont voir les logs')
                    .setRequired(false)
            )
            .addIntegerOption(option =>
                option
                    .setName('limite')
                    .setDescription('Nombre de logs à afficher')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(50)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('reactions')
            .setDescription('Affiche les logs de réactions')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('Utilisateur dont voir les logs')
                    .setRequired(false)
            )
            .addIntegerOption(option =>
                option
                    .setName('limite')
                    .setDescription('Nombre de logs à afficher')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(50)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('top')
            .setDescription('Affiche les tops')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Type de top à afficher')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Commandes les plus utilisées', value: 'commands' },
                        { name: 'Utilisateurs les plus actifs', value: 'users' }
                    )
            )
            .addIntegerOption(option =>
                option
                    .setName('limite')
                    .setDescription('Nombre d\'éléments à afficher')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(20)
            )
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

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'stats':
                await handleLogStats(interaction);
                break;
            case 'commands':
                await handleCommandLogs(interaction);
                break;
            case 'reactions':
                await handleReactionLogs(interaction);
                break;
            case 'top':
                await handleTopLogs(interaction);
                break;
        }
    } catch (error) {
        console.error('Erreur lors de la gestion des logs:', error);
        await interaction.editReply({
            content: '❌ Une erreur s\'est produite lors de la récupération des logs.'
        });
    }
};

async function handleLogStats(interaction: any) {
    const stats = await Logger.getLogStats();
    
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📊 Statistiques des logs')
        .addFields(
            { 
                name: '📈 Total', 
                value: `**Commandes :** ${stats.totalCommands}\n**Réactions :** ${stats.totalReactions}`, 
                inline: true 
            },
            { 
                name: '📅 Aujourd\'hui', 
                value: `**Commandes :** ${stats.todayCommands}\n**Réactions :** ${stats.todayReactions}`, 
                inline: true 
            }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleCommandLogs(interaction: any) {
    const targetUser = interaction.options.getUser('utilisateur');
    const limit = interaction.options.getInteger('limite') || 10;
    
    const userId = targetUser ? targetUser.id : interaction.user.id;
    const logs = await Logger.getUserCommandLogs(userId, limit);
    
    if (logs.length === 0) {
        await interaction.editReply('📝 Aucun log de commande trouvé.');
        return;
    }

    const logsText = logs.map((log: any, index: number) => {
        const status = log.success ? '✅' : '❌';
        const time = new Date(log.createdAt).toLocaleString('fr-FR');
        const args = log.args ? ` (${log.args})` : '';
        return `${index + 1}. ${status} **${log.commandName}**${args} - ${time}`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`📝 Logs de commandes de ${targetUser ? targetUser.username : interaction.user.username}`)
        .setDescription(logsText)
        .setFooter({ text: `${logs.length} commandes affichées` })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleReactionLogs(interaction: any) {
    const targetUser = interaction.options.getUser('utilisateur');
    const limit = interaction.options.getInteger('limite') || 10;
    
    const userId = targetUser ? targetUser.id : interaction.user.id;
    const logs = await Logger.getUserReactionLogs(userId, limit);
    
    if (logs.length === 0) {
        await interaction.editReply('👍 Aucun log de réaction trouvé.');
        return;
    }

    const logsText = logs.map((log: any, index: number) => {
        const action = log.action === 'add' ? '➕' : '➖';
        const time = new Date(log.createdAt).toLocaleString('fr-FR');
        const ootd = log.isOOTD ? ' (OOTD)' : '';
        const tokens = log.tokensEarned ? ` (+${log.tokensEarned} tokens)` : '';
        return `${index + 1}. ${action} ${log.emoji}${ootd}${tokens} - ${time}`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`👍 Logs de réactions de ${targetUser ? targetUser.username : interaction.user.username}`)
        .setDescription(logsText)
        .setFooter({ text: `${logs.length} réactions affichées` })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleTopLogs(interaction: any) {
    const type = interaction.options.getString('type');
    const limit = interaction.options.getInteger('limite') || 10;

    switch (type) {
        case 'commands':
            const topCommands = await Logger.getMostUsedCommands(limit);
            const commandsText = topCommands.map((cmd: any, index: number) => {
                return `${index + 1}. **${cmd.commandName}** - ${cmd._count.commandName} utilisations`;
            }).join('\n');

            const commandsEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🏆 Commandes les plus utilisées')
                .setDescription(commandsText)
                .setFooter({ text: `Top ${limit} commandes` })
                .setTimestamp();
            await interaction.editReply({ embeds: [commandsEmbed] });
            break;

        case 'users':
            const topUsers = await Logger.getMostActiveUsers(limit);
            const usersText = topUsers.map((user: any, index: number) => {
                return `${index + 1}. <@${user.userId}> - ${user._count.userId} commandes`;
            }).join('\n');

            const usersEmbed = new EmbedBuilder()
                .setColor(0xFFD700)
                .setTitle('🏆 Utilisateurs les plus actifs')
                .setDescription(usersText)
                .setFooter({ text: `Top ${limit} utilisateurs` })
                .setTimestamp();
            await interaction.editReply({ embeds: [usersEmbed] });
            break;

        default:
            await interaction.editReply('❌ Type invalide. Utilisez `commands` ou `users`.');
    }
} 