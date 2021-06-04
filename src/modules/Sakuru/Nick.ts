import { Command } from "../../Command";
import { Module } from "../../Module";

export default class SakuruNick extends Command {
    constructor(module: Module) {
        super(["n", "nick", "", ""], module, async (ctx, self, args) => {
            if(!args.nickname[0])
                return ctx.reply("Не указан ник!")
            try {
                let user = await self.module.bot.api.sakuru.getUser(args.nickname.join(" "));
                await self.module.bot.database.servers.sakuru.setNickname(ctx.senderId, user.id, user.nickname);
                ctx.reply(`[Server: ${self.module.name}]\nУстановлен ник: ${args.nickname.join(" ")}`);
            } catch (e) {
                ctx.reply("Такого пользователя не существует");
            }
        })
    }
}