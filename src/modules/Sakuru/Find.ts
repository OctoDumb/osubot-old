import { Command } from "../../Command";
import { Module } from "../../Module";
import Util from "../../Util";

export default class SakuruFind extends Command {
    constructor(module: Module) {
        super(["f", "find", "а", "аштв"], module, async (ctx, self, args) => {
            if(!args.nickname[0])
                return ctx.reply("Укажите ник!");
            try {
                let u = await self.module.bot.api.sakuru.getUser(args.nickname.join(" "));
                let users = await self.module.bot.database.servers.sakuru.findByUserId(u.id);
                if(!users[0])
                    return ctx.reply("Не найдено пользователей с таким ником!");
                let keyboard = Util.createKeyboard([
                    [{
                        text: 'Посмотреть профиль',
                        command: `c u ${u.nickname}`
                    }]
                ]);
                ctx.reply(`[Server: ${self.module.name}]\nПользователи с ником ${u.nickname}:\n${users.map(us => `https://vk.com/id${us.id}`).join("\n")}`, { keyboard });
            } catch(e) {
                ctx.reply("Ошибка");
            }
        });
    }
}