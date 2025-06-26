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
        
        // Déployer les commandes globalement
        console.log('🌍 Déploiement global des commandes...');
        
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
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