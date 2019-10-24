import { Command } from "../../Command";
import { Module } from "../../Module";
import Calculator from '../../pp/bancho';

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
                let calc = new Calculator(map, recent.mods);
                let pp = calc.calculate(recent);
                ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.RecentScore(recent, map, pp)}`, {
                    attachment: cover
                });
                self.module.bot.maps.setMap(ctx.peerId, map);
            } catch(e) {
                ctx.reply(`Ошибка лул`);
            }
        });
    }
}