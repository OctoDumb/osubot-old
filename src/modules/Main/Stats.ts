import { Command } from "../../Command";
import { Module } from "../../Module";

export default class StatsCommand extends Command {
    constructor(module: Module) {
        super("stats", module, (ctx, self) => {
            let uptime = Math.floor((Date.now() - self.module.bot.startTime) / 1e3);
            let up = `${Math.floor(uptime / 3600 / 24)}д ${Math.floor(uptime / 3600) % 24}ч ${Math.floor(uptime / 60) % 60}м ${uptime % 60}с`;

            let cmdsUsed = 0;
            self.module.bot.modules.forEach(m => {
                m.commands.forEach(c => {
                    if(m.name != "Admin")
                        cmdsUsed += c.uses;
                });
            });

            ctx.send(`Статистика бота:\nВремя работы: ${up}\nСообщений получено: ${self.module.bot.totalMessages}\nКоманд использовано: ${cmdsUsed}`);
        });
    }
}