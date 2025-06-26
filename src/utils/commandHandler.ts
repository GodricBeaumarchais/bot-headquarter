import { Collection, Client } from 'discord.js';
import { Command } from '../types/Command';
import { moneyCommands } from '../commands/money';
import ping from '../commands/admin/ping';
import * as generate from '../commands/admin/generate';
import * as remove from '../commands/admin/remove';
import * as exchange from '../commands/admin/exchange';
import * as logs from '../commands/admin/logs';
import { withLogging } from './commandWrapper';

export class CommandHandler {
    private commands: Collection<string, Command> = new Collection();
    
    constructor(private client: Client) {}
    
    public loadCommands(): void {
        // Charger les commandes money (déjà avec logging)
        moneyCommands.forEach(command => {
            this.commands.set(command.data.name, command);
        });
        
        // Charger les commandes admin avec logging
        this.commands.set(ping.data.name, withLogging(ping));
        this.commands.set(generate.data.name, withLogging(generate as Command));
        this.commands.set(remove.data.name, withLogging(remove as Command));
        this.commands.set(exchange.data.name, withLogging(exchange as Command));
        this.commands.set(logs.data.name, withLogging(logs as Command));
        
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