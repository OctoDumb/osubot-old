import { Command } from '../../Command';
import { Module } from '../../Module';
// import { User } from '../../Types';

export default class BanchoNick extends Command {
    constructor(module: Module) {
        super(["n", "nick"], module, async (ctx, self, args) => {
            if(!args[0])
                return ctx.reply("Не указан ник!");
            try {
                let user = await self.module.bot.api.bancho.getUser(args.join(" "));
                await self.module.bot.database.servers.bancho.setNickname(ctx.senderId, user.id, args.join(" "));
                await self.module.bot.database.servers.bancho.updateInfo(user);
                ctx.reply(`[Server: ${self.module.name}]\nУстановлен ник: ${args.join(" ")}`);
            } catch(err) {
                ctx.reply("Такого пользователя не существует!");
            }
        });
    }
}