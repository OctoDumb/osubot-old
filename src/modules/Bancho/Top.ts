import { Command } from '../../Command';
import { Module } from '../../Module';
import Util from '../../Util';

export default class BanchoTop extends Command {
    constructor(module: Module) {
        super(["t", "top"], module, async (ctx, self, args) => {
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
                let user = await self.module.bot.api.bancho.getUser(dbUser.nickname);
                let top = await self.module.bot.api.bancho.getUserTop(dbUser.nickname, dbUser.mode || 0, 3);
                let maps = await Promise.all(top.map(s => self.module.bot.api.bancho.getBeatmap(s.beatmapId, dbUser.mode || 0, s.mods.diff())));
                ctx.reply(`[Server: ${self.module.name}]\nТоп скоры игрока ${user.nickname} [${Util.profileModes[dbUser.mode || 0]}]:\n${maps.map((map, i) => new self.module.bot.templates.TopScoreTemplate(top[i], map, i+1).use()).join("\n")}`);
            } catch(err) {
                console.log(err);
            }
        });
    }
}