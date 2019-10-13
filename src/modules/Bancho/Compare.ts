import { Command } from "../../Command";
import { Module } from "../../Module";
import Mods from "../../pp/Mods";

export default class BanchoCompare extends Command {
    constructor(module: Module) {
        super(["c", "compare"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.bancho.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser = await self.module.bot.database.servers.bancho.getUser(ctx.replyMessage.senderId);
            if(ctx.hasForwards)
                dbUser = await self.module.bot.database.servers.bancho.getUser(ctx.forwards[0].senderId);
            if(args[0])
                dbUser.nickname = args.string.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            try {
                let chat = self.module.bot.maps.getChat(ctx.peerId);
                if(!chat)
                    return ctx.reply("Отправьте карту!");
                let score = await self.module.bot.api.bancho.getScore(dbUser.nickname, chat.map.id.map, dbUser.mode || 0, args.mods.length == 0 ? undefined : new Mods(args.mods).sum());
                let map = await self.module.bot.api.bancho.getBeatmap(chat.map.id.map, dbUser.mode || 0, args.mods.length == 0 ? undefined : new Mods(args.mods).sum());
                let cover = await self.module.bot.database.covers.getCover(map.id.set);
                try {
                    switch(dbUser.mode || 0) {
                        case 0: {
                            ctx.reply(new self.module.bot.templates.CompareTemplate(score, map).use(), {
                                attachment: cover
                            });
                        }

                        default: {
                            // Nothing yet..
                        }
                    }
                } catch(e) {
                    //
                }
            } catch(e) {
                //
            }
        });
    }
}