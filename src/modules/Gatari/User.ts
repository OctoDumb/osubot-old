import axios from "axios";
import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";

export default class GatariUser extends Command {
    constructor(module: Module) {
        super(["u", "user", "г", "гыук"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.gatari.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.gatari.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.gatari.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            let mode = args.mode === null ? dbUser.mode || 0 : args.mode;
            try {
                let user = await self.module.bot.api.gatari.getUser(dbUser.nickname, mode);
                let status = self.module.bot.donaters.status("gatari", user.id);
                self.module.bot.database.servers.gatari.updateInfo(user, mode);
                let keyboard = Util.createKeyboard([
                    [{
                        text: `Топ скоры ${user.nickname}`,
                        command: `g t ${user.nickname} ${Util.getModeArg(mode)}`
                    }],
                    [{
                        text: `Последний скор ${user.nickname}`,
                        command: `g r ${user.nickname} ${Util.getModeArg(mode)}`
                    }]
                ]);

                ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.User(user, mode, status, self.module.link)}`, { 
                    keyboard
                });
            } catch (e) {
                let err = await self.module.bot.database.errors.addError("g", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}