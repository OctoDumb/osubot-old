import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";
import BanchoPP from "../../pp/bancho";

export default class SakuruTop extends Command {
    constructor(module: Module) {
        super(["t", "top", "е", "ещз"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.sakuru.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.sakuru.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.sakuru.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            let mode = args.mode === null ? dbUser.mode || 0 : args.mode;
            try {
                let user = await self.module.bot.api.sakuru.getUser(dbUser.nickname, mode);
                self.module.bot.database.servers.sakuru.updateInfo(user, mode);
                let status = self.module.bot.donaters.status("sakuru", user.id);
                if(args.apx) {
                    let top = await self.module.bot.api.sakuru.getUserTop(dbUser.nickname, mode, 100);
                    let nearest = top[0];
                    let place = 1;
                    for(let i = 0; i < top.length; i++) {
                        if(Math.abs(top[i].pp - args.apx) < Math.abs(nearest.pp - args.apx)) {
                            nearest = top[i];
                            place = i+1;
                        }
                    }
                    let map = await self.module.bot.api.bancho.getBeatmap(nearest.beatmapId, mode, nearest.mods.diff());
                    let cover = await self.module.bot.database.covers.getCover(map.id.set);
                    let calc = new BanchoPP(map, nearest.mods);
                    self.module.bot.maps.setMap(ctx.peerId, map);
                    ctx.reply(`[Server: ${self.module.name}] Ближайшее к ${args.apx}pp\n${self.module.bot.templates.TopSingle(nearest, map, user, place, calc, self.module.link, status)}`, {
                        attachment: cover
                    });
                } else if(args.more) {
                    let top = await self.module.bot.api.sakuru.getUserTop(dbUser.nickname, mode, 100);
                    let amount = top.filter(t => t.pp > args.more).length;
                    ctx.reply(`[Server: ${self.module.name}]\nУ игрока ${user.nickname} ${amount ? amount : 'нет'}${amount == 100 ? '+' : ''} ${Util.scoreNum(amount)} выше ${args.more}pp`);
                } else if(args.place) {
                    let score = (await self.module.bot.api.sakuru.getUserTop(dbUser.nickname, mode, args.place))[args.place - 1];
                    let map = await self.module.bot.api.bancho.getBeatmap(score.beatmapId, mode, score.mods.diff());
                    let cover = await self.module.bot.database.covers.getCover(map.id.set);
                    let calc = new BanchoPP(map, score.mods);
                    let keyboard = Util.createKeyboard([
                        [{
                            text: '[R] Мой скор на карте',
                            command: `{map${map.id.map}}c c`
                        }],
                        ctx.isChat ? [{
                            text: '[R] Топ чата на карте',
                            command: `{map${map.id.map}}c lb`
                        }] : []
                    ]);
                    self.module.bot.maps.setMap(ctx.peerId, map);
                    ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.TopSingle(score, map, user, args.place, calc, self.module.link, status)}`, {
                        attachment: cover,
                        keyboard
                    });
                } else {
                    let top = await self.module.bot.api.sakuru.getUserTop(dbUser.nickname, mode, 3);
                    let maps = await Promise.all(top.map(s => self.module.bot.api.bancho.getBeatmap(s.beatmapId, mode, s.mods.diff())));
                    let str = maps.map((map, i) => {
                        let calc = new BanchoPP(map, top[i].mods);
                        return self.module.bot.templates.TopScore(top[i], map, i+1, calc, self.module.link);
                    }).join("\n");
                    ctx.reply(`[Server: ${self.module.name}]\nТоп скоры игрока ${user.nickname} ${status} [${Util.profileModes[mode]}]:\n${str}`);
                }
            } catch(e) {
                let err = await self.module.bot.database.errors.addError("u", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}