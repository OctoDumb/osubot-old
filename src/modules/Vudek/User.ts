import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";

export default class VudekUser extends Command {
    constructor(module: Module) {
        super(["u", "user"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.vudek.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.vudek.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.vudek.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            let mode = args.mode === null ? dbUser.mode || 0 : args.mode;
            try {
                let user = await self.module.bot.api.vudek.getUser(dbUser.nickname, mode);
                let status = self.module.bot.donaters.status("vudek", user.id);
                if(!dbUser.mode)
                    self.module.bot.database.servers.vudek.updateInfo(user, mode);
                ctx.reply(`[Server:${self.module.name}]\n${self.module.bot.templates.User(user, mode, status, self.module.link)}`);
            } catch(e) {
                let err = await self.module.bot.database.errors.addError("r", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}