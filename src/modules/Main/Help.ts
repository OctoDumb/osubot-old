import { Command } from "../../Command";
import { Module } from "../../Module";

export default class HelpCommand extends Command {
    constructor(module: Module) {
        super(["help", "хелп", "рудз"], module, (ctx, self, args) => {
            ctx.reply("https://vk.com/@sosubot-bothelp");
        });
    }
}
