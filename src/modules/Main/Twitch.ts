import { Command } from "../../Command";
import { Module } from "../../Module";

export default class StreamsCommand extends Command {
    constructor(module: Module) {
        super(["streams", "twitch"], module, async (ctx, self) => {
            let streams = self.module.bot.streamers.slice(0, 3);
            ctx.reply(`Топ-3 osu! стримера:\n${streams.map(s => `${s.url} - ${s.title}\n${s.viewers} зрителей`).join('\n')}`);
        });
    }
}