import { Command } from "./Command";
import Bot from "./Bot";
import { MessageContext } from "vk-io";

interface ICommandsModule {
    name: String,
    prefix: String | String[],
    commands: Command[],
    bot: Bot
}

export class Module implements ICommandsModule {
    name: string;
    link?: string;
    prefix: String | String[];
    commands: Command[];
    bot: Bot;
    constructor(prefix: String | String[], bot: Bot) {
        this.prefix = prefix;
        this.bot = bot;
        this.commands = [];
    }

    registerCommand(command: Command | Command[]) {
        if(Array.isArray(command))
            this.commands.push(...command);
        else
            this.commands.push(command);
    }

    checkContext(ctx: MessageContext): Command {
        if(!ctx.hasText)
            return null;
        var args = ctx.text.split(" ");
        if(args.length < 2)
            return null;
        var prefix = args.shift();
        var command = args.shift();
        if(!this.checkPrefix(prefix.toLowerCase()) || !this.findCommand(command))
            return null;
        else
            return this.findCommand(command);
    }

    checkPrefix(prefix: string): boolean {
        if(Array.isArray(this.prefix))
            return this.prefix.includes(prefix);
        else
            return this.prefix == prefix;
    }

    findCommand(command: String): Command | null {
        return this.commands.find(cmd => cmd.check(command)) || null;
    }
}