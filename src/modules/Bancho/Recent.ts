import { Command } from "../../Command";
import { Module } from "../../Module";
import Calculator from '../../pp/bancho';

export default class BanchoRecent extends Command {
    constructor(module: Module) {
        super(["r", "rp", "recent"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.bancho.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.bancho.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.bancho.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.string[0])
                dbUser.nickname = args.string.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            try {
                let recent = await self.module.bot.api.bancho.getUserRecent(dbUser.nickname, dbUser.mode || 0);
                let map = await self.module.bot.api.bancho.getBeatmap(recent.beatmapId, recent.mode, recent.mods.diff());
                let cover = await self.module.bot.database.covers.getCover(map.id.set);
                let calc = new Calculator(map, recent.mods);
                ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.RecentScore(recent, map, calc, self.module.link)}`, {
                    attachment: cover
                });
                self.module.bot.maps.setMap(ctx.peerId, map);
            } catch(e) {
                ctx.reply(`Ошибка лул`);
            }
        });
    }
}