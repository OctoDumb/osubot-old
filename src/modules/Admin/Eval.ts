import { Command } from "../../Command";
import { Module } from "../../Module";

export default class EvalCommand extends Command {
    constructor(module: Module) {
        super(["eval"], module, async (ctx, self, args) => {
            if(ctx.senderId != module.bot.config.vk.owner) return;

            eval(args.full.join(" "));
        });
    }
}