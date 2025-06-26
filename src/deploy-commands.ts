import { REST, Routes } from 'discord.js';
import { CommandHandler } from './utils/commandHandler';
import { Client } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [] });
const commandHandler = new CommandHandler(client);

async function deployCommands() {
    try {
        console.log('🚀 Déploiement des commandes slash...');
        
        // Charger les commandes
        commandHandler.loadCommands();
        const commands = commandHandler.getAllCommandsData();
        
        console.log(`📝 ${commands.length} commandes à déployer :`);
        commands.forEach(cmd => console.log(`  - /${cmd.name}: ${cmd.description}`));
        
        // Créer l'instance REST
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        
        // Extraire le CLIENT_ID du token Discord
        const clientId = process.env.DISCORD_TOKEN!.split('.')[0];
        
        // Déployer les commandes globalement
        console.log('🌍 Déploiement global des commandes...');
        
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );
        
        console.log(`✅ ${(data as any[]).length} commandes déployées avec succès !`);
        
        // Afficher les commandes déployées
        console.log('\n📋 Commandes déployées :');
        (data as any[]).forEach((cmd: any) => {
            console.log(`  - /${cmd.name}: ${cmd.description}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du déploiement des commandes:', error);
    }
}

// Exécuter le déploiement
deployCommands(); 