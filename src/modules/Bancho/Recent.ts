import { Command } from "../../Command";
import { Module } from "../../Module";
import Calculator from '../../pp/bancho';
import Util from "../../Util";

export default class BanchoRecent extends Command {
    constructor(module: Module) {
        super(["r", "rp", "recent"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.bancho.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.bancho.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.bancho.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            let mode = args.mode === null ? dbUser.mode || 0 : args.mode;
            try {
                let recent = await self.module.bot.api.bancho.getUserRecent(dbUser.nickname, mode, args.place || 1);
                let map = await self.module.bot.api.bancho.getBeatmap(recent.beatmapId, recent.mode, recent.mods.diff());
                let cover = await self.module.bot.database.covers.getCover(map.id.set);
                let calc = new Calculator(map, recent.mods);
                let keyboard = Util.createKeyboard([
                    [{
                        text: '[B] Мой скор на карте',
                        command: `{map${map.id.map}}s c`
                    }],
                    ctx.isChat ? [{
                        text: '[B] Топ чата на карте',
                        command: `{map${map.id.map}}s lb`
                    }] : []
                ]);
                ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.RecentScore(recent, map, calc, self.module.link)}`, {
                    attachment: cover,
                    keyboard
                });
                self.module.bot.maps.setMap(ctx.peerId, map);
            } catch(e) {
                let err = await self.module.bot.database.errors.addError("b", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}