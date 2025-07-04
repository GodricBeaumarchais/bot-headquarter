import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Message, Events, Partials } from 'discord.js';
import { CommandHandler } from './utils/commandHandler';
import { PrefixCommandHandler } from './utils/prefixCommandHandler';
import { DatabaseManager } from './utils/database';
import { BOT_PREFIX } from './utils/constants';
import * as messageReactionAddEvent from './events/messageReactionAdd';
import * as messageReactionRemoveEvent from './events/messageReactionRemove';
import { handleChifumiAccept, handleChifumiDecline, handleChifumiChoice } from './utils/chifumiHandler';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

// Gestionnaires de commandes
const commandHandler = new CommandHandler(client);
const prefixCommandHandler = new PrefixCommandHandler(client);

client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user?.tag}`);
    console.log('🤖 Bot prêt à recevoir des commandes !');
    console.log(`📝 Préfixe des commandes : ${BOT_PREFIX}`);
    console.log('🔧 Commandes slash disponibles');
    console.log('👗 Système OOTD activé');
    console.log('👑 Système de rôles activé');
    
    // Vérifier la configuration OOTD
    console.log(`📍 Canal OOTD configuré: ${process.env.OOTD_CHANNEL_ID || 'NON CONFIGURÉ'}`);
    
    // Initialiser les rôles dans la base de données
    try {
        await DatabaseManager.initializeRoles();
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des rôles:', error);
    }
    
    // Charger les commandes slash
    commandHandler.loadCommands();
});

// Gestion des commandes slash
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandHandler.getCommand(interaction.commandName);
    
    if (!command) {
        await interaction.reply({
            content: '❌ Commande inconnue',
            ephemeral: true
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
        
        const reply = {
            content: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande.',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

// Gestion des commandes avec préfixe et OOTD
client.on(Events.MessageCreate, async (message: Message) => {
    await prefixCommandHandler.handleMessage(message);
});

// Gestion des interactions de boutons
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    
    if (customId.startsWith('chifumi_')) {
        await handleChifumiButton(interaction, customId);
    }
});

async function handleChifumiButton(interaction: any, customId: string) {
    try {
        const parts = customId.split('_');
        const action = parts[1];
        
        if (action === 'accept') {
            const gameId = parts[2];
            await handleChifumiAccept(interaction, gameId);
        } else if (action === 'decline') {
            const gameId = parts[2];
            await handleChifumiDecline(interaction, gameId);
        } else if (action === 'choice') {
            const gameId = parts[2];
            const choice = parts[3]; // rock, paper, scissors
            await handleChifumiChoice(interaction, gameId, choice);
        }
    } catch (error) {
        console.error('Erreur lors du traitement du bouton chifumi:', error);
        await interaction.reply({
            content: '❌ Une erreur s\'est produite.',
            ephemeral: true
        });
    }
}

// Gestion des réactions OOTD (ajout)
client.on(Events.MessageReactionAdd, async (reaction, user, ...args) => {
    await messageReactionAddEvent.execute(reaction, user, ...args);
});

// Gestion des retraits de réactions OOTD
client.on(Events.MessageReactionRemove, async (reaction, user, ...args) => {
    await messageReactionRemoveEvent.execute(reaction, user, ...args);
});

client.login(process.env.DISCORD_TOKEN); 