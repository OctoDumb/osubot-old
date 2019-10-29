import { Command } from "../../Command";
import { Module } from "../../Module";

export default class NewsCommand extends Command {
    constructor(module: Module) {
        super("news", module, async (ctx, self) => {
            if(!ctx.isChat)
                return;
            try {
                let chat = (await self.module.bot.vk.api.messages.getConversationMembers({
                    peer_id: ctx.peerId
                }));

                let user = chat.items.find(m => m.member_id == ctx.senderId);

                if(!user.is_admin)
                    return ctx.reply("Вы не можете управлять рассылкой!");

                let n = self.module.bot.news.switch(ctx.peerId);

                ctx.reply(`Рассылка ${n ? 'включена' : 'отключена'}!`);
            } catch(e) {
                ctx.reply("Мне нужны права администратора, чтобы проверить, являетесь ли Вы администратором!");
            }
        });
    }
}