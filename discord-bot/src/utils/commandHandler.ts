import { Collection, Client } from 'discord.js';
import { Command } from '../types/Command';
import { slashCommands } from '../commands/slash';
import { withLogging } from './commandWrapper';

export class CommandHandler {
    private commands: Collection<string, Command> = new Collection();
    
    constructor(private client: Client) {}
    
    public loadCommands(): void {
        // Charger toutes les commandes slash
        slashCommands.forEach(command => {
            this.commands.set(command.data.name, command);
        });
        
        console.log(`✅ ${this.commands.size} commandes chargées`);
    }
    
    public getCommands(): Collection<string, Command> {
        return this.commands;
    }
    
    public getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }
    
    public getAllCommandsData() {
        return Array.from(this.commands.values()).map(command => command.data.toJSON());
    }
} 