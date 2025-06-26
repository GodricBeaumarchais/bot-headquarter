import { Collection, Client } from 'discord.js';
import { Command } from '../types/Command';
import { moneyCommands } from '../commands/money';
import ping from '../commands/admin/ping';

export class CommandHandler {
    private commands: Collection<string, Command> = new Collection();
    
    constructor(private client: Client) {}
    
    public loadCommands(): void {
        // Charger les commandes money
        moneyCommands.forEach(command => {
            this.commands.set(command.data.name, command);
        });
        
        // Charger les commandes admin
        this.commands.set(ping.data.name, ping);
        
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