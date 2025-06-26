import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Message, Events } from 'discord.js';
import { CommandHandler } from './utils/commandHandler';
import { PrefixCommandHandler } from './utils/prefixCommandHandler';
import { DatabaseManager } from './utils/database';
import { BOT_PREFIX } from './utils/constants';
import * as messageReactionAddEvent from './events/messageReactionAdd';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ],
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

// Gestion des réactions OOTD
client.on(Events.MessageReactionAdd, async (reaction, user, ...args) => {
    await messageReactionAddEvent.execute(reaction, user, ...args);
});

client.login(process.env.DISCORD_TOKEN); 