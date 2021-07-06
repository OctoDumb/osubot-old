import axios from "axios";
import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";

export default class EnjuuUser extends Command {
    constructor(module: Module) {
        super(["u", "user", "г", "гыук"], module, async (ctx, self, args) => {
            let dbUser = await self.module.bot.database.servers.enjuu.getUser(ctx.senderId);
            if(ctx.hasReplyMessage)
                dbUser.nickname = (await self.module.bot.database.servers.enjuu.getUser(ctx.replyMessage.senderId)).nickname;
            if(ctx.hasForwards)
                dbUser.nickname = (await self.module.bot.database.servers.enjuu.getUser(ctx.forwards[0].senderId)).nickname;
            if(args.nickname[0])
                dbUser.nickname = args.nickname.join(" ");
            if(!dbUser.nickname)
                return ctx.reply("Не указан ник!");
            let mode = args.mode === null ? dbUser.mode || 0 : args.mode;
            try {
                let user = await self.module.bot.api.enjuu.getUser(dbUser.nickname, mode);
                let status = self.module.bot.donaters.status("enjuu", user.id);
                if(!dbUser.mode)
                    self.module.bot.database.servers.enjuu.updateInfo(user, mode);

                let { data: cover } = await axios.get(`https://i.imgur.com/ePyB83o.png`, {
                    responseType: "arraybuffer"
                });
                
                ctx.reply(`[Server: ${self.module.name}]\n${self.module.bot.templates.User(user, mode, status, self.module.link)}`);
            } catch (e) {
                let err = await self.module.bot.database.errors.addError("a", ctx, String(e));
                ctx.reply(`[Server: ${self.module.name}]\n${Util.error(String(e))} (${err})`);
            }
        });
    }
}