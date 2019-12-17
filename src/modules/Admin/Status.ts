import { Command } from "../../Command";
import { Module } from "../../Module";

export default class StatusCommand extends Command {
    constructor(module: Module) {
        super("status", module, async (ctx, self, args) => {
            if(args.full.length < 3)
                return ctx.reply("Недостаточно аргументов!");
            self.module.bot.donaters.setDonater(args.full[0], Number(args.full[1]), args.full[2]);
        });
    }
}