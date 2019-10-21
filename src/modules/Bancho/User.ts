import { Command } from "../../Command";
import { Module } from "../../Module";
// import Util from '../../Util';

export default class BanchoUser extends Command {
    constructor(module: Module) {
        super(["u", "user"], module, async (ctx, self, args) => {
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
                let user = await self.module.bot.api.bancho.getUser(dbUser.nickname, dbUser.mode || 0);
                ctx.reply(self.module.bot.templates.User(user, self.module, dbUser.mode || 0));
            } catch(err) {
                ctx.reply("Ошибка");
            }
        });
    }
};