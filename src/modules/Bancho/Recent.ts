import { Command } from "../../Command";
import { Module } from "../../Module";

export default class BanchoRecent extends Command {
    constructor(module: Module) {
        super(["r", "rp", "recent"], module, async (ctx, self, args) => {
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
                // let user = await self.module.bot.api.bancho.getUser(dbUser.nickname);
                let recent = await self.module.bot.api.bancho.getUserRecent(dbUser.nickname, dbUser.mode || 0);
                let map = await self.module.bot.api.bancho.getBeatmap(recent.beatmapId, recent.mode, recent.mods.diff());
                let cover = await self.module.bot.database.covers.getCover(map.id.set);
                ctx.reply(`[Server: ${self.module.name}]\n${new self.module.bot.templates.RecentScoreTemplate(recent, map).use()}`, {
                    attachment: cover
                });
            } catch(e) {
                ctx.reply(`Ошибка лул`);
            }
        });
    }
}