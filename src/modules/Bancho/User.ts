import { Command } from "../../Command";
import { Module } from "../../Module";
// import Util from '../../Util';

export default class BanchoUser extends Command {
    constructor(module: Module) {
        super(["u", "user"], module, async (ctx, self, args) => {
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
                let user = await self.module.bot.api.bancho.getUser(dbUser.nickname, dbUser.mode || 0);
                self.module.bot.database.servers.bancho.updateInfo(user);
                ctx.reply(`[Server:${self.module.name}]\n${self.module.bot.templates.User(user, dbUser.mode || 0)}`);
            } catch(err) {
                ctx.reply("Ошибка");
            }
        });
    }
};