import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";
import BanchoPP from "../../pp/bancho";

export default class EnjuuTop extends Command {
    constructor(module: Module) {
        super(["t", "top"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.enjuu.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.enjuu.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.enjuu.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            try {
                let user = await self.module.bot.api.enjuu.getUser(dbUser.nickname);
                if(!dbUser.mode)
                    self.module.bot.database.servers.enjuu.updateInfo(user);
                if(args.apx) {
                    let top = await self.module.bot.api.enjuu.getUserTop(dbUser.nickname, dbUser.mode || 0, 100);
                    let nearest = top[0];
                    let place = 1;
                    for(let i = 0; i < top.length; i++) {
                        if(Math.abs(top[i].pp - args.apx) < nearest.pp - args.apx) {
                            nearest = top[i];
                            place = i+1;
                        }
                    }
                    let map = await self.module.bot.api.bancho.getBeatmap(nearest.beatmapId, dbUser.mode || 0, nearest.mods.diff());
                    let cover = await self.module.bot.database.covers.getCover(map.id.set);
                    let calc = new BanchoPP(map, nearest.mods);
                    ctx.reply(`[Server: ${self.module.name}] Ближайшее к ${args.apx}pp\n${self.module.bot.templates.TopSingle(nearest, map, user, place, calc, self.module.link)}`, {
                        attachment: cover
                    });
                } else if(args.more) {
                    let top = await self.module.bot.api.enjuu.getUserTop(dbUser.nickname, dbUser.mode || 0, 100);
                    let amount = top.filter(t => t.pp > args.more).length;
                    ctx.reply(`[Server: ${self.module.name}]\nУ игрока ${user.nickname} ${amount ? amount : 'нет'}${amount == 100 ? '+' : ''} ${Util.scoreNum(amount)} выше ${args.more}pp`);
                } else if(args.place) {
                    let score = (await self.module.bot.api.enjuu.getUserTop(dbUser.nickname, dbUser.mode || 0, args.place))[args.place - 1];
                    let map = await self.module.bot.api.bancho.getBeatmap(score.beatmapId, dbUser.mode || 0, score.mods.diff());
                    let cover = await self.module.bot.database.covers.getCover(map.id.set);
                    let calc = new BanchoPP(map, score.mods);
                    self.module.bot.maps.setMap(ctx.peerId, map);
                    ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.TopSingle(score, map, user, args.place, calc, self.module.link)}`, {
                        attachment: cover
                    });
                } else {
                    let top = await self.module.bot.api.enjuu.getUserTop(dbUser.nickname, dbUser.mode || 0, 3);
                    let maps = await Promise.all(top.map(s => self.module.bot.api.bancho.getBeatmap(s.beatmapId, dbUser.mode || 0, s.mods.diff())));
                    let str = maps.map((map, i) => {
                        let calc = new BanchoPP(map, top[i].mods);
                        return self.module.bot.templates.TopScore(top[i], map, i+1, calc, self.module.link);
                    }).join("\n");
                    ctx.reply(`[Server: ${self.module.name}]\nТоп скоры игрока ${user.nickname} [${Util.profileModes[dbUser.mode || 0]}]:\n${str}`);
                }
            } catch(e) {
                let err = await self.module.bot.database.errors.addError("a", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}