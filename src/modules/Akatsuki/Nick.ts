import { Command } from "../../Command";
import { Module } from "../../Module";

export default class AkatsukiNick extends Command {
    constructor(module: Module) {
        super(["n", "nick", "nickname"], module, async (ctx, self, args) => {
            if(!args.nickname[0])
                return ctx.reply("Не указан ник!")
            try {
                let user = await self.module.bot.api.akatsuki.getUser(args.nickname.join(" "));
                await self.module.bot.database.servers.akatsuki.setNickname(ctx.senderId, user.id, user.nickname);
                ctx.reply(`[Server: ${self.module.name}]\nУстановлен ник: ${args.nickname.join(" ")}`);
            } catch (e) {
                ctx.reply("Такого пользователя не существует");
            }
        });
    }
}