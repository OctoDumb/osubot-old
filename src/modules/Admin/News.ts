import { Command } from "../../Command";
import { Module } from "../../Module";

export default class NewsCommand extends Command {
    constructor(module: Module) {
        super(["n", "news"], module, async (ctx, self, args) => {
            if(ctx.senderId != module.bot.config.vk.owner) return;
            
            if(!ctx.replyMessage && !ctx.hasForwards)
                return ctx.reply("Перешлите сообщение для рассылки!");

            let msg = ctx.replyMessage || ctx.forwards[0];

            module.bot.news.notify(msg.text, msg.attachments.map(att => att.toString()).join(","));
        });
    }
}