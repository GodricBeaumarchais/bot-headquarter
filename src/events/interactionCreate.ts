import { Events, ChatInputCommandInteraction } from 'discord.js';
import { Event } from '../types/Event';
import { CommandHandler } from '../utils/commandHandler';

export const name = Events.InteractionCreate;
export const once = false;

export const execute: Event<typeof name>['execute'] = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    const commandHandler = new CommandHandler(interaction.client);
    commandHandler.loadCommands();
    
    const command = commandHandler.getCommand(interaction.commandName);
    
    if (!command) {
        console.error(`❌ Commande ${interaction.commandName} non trouvée`);
        return;
    }
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de la commande ${interaction.commandName}:`, error);
        
        const errorMessage = '❌ Une erreur s\'est produite lors de l\'exécution de cette commande.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}; 