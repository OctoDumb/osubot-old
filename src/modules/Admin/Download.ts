import { Command } from "../../Command";
import { Module } from "../../Module";
import fs from "fs";

export default class DownloadCommand extends Command {
    constructor(module: Module) {
        super(["download", "dl"], module, async (ctx, self, args) => {
            let path = args.full.join(" ");
            if(!fs.existsSync(path))
                return ctx.reply("Такого файла не существует!");
            
            let att = await self.module.bot.vk.upload.messageDocument({
                peer_id: ctx.peerId,
                title: path.split("/").pop(),
                source: path
            });

            ctx.send(`Файл ${path}`, {
                attachment: att.toString()
            });
        });

        this.permission = (ctx) => ctx.senderId == module.bot.config.vk.owner;
    }
}