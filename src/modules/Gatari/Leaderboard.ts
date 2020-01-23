import { Command } from "../../Command";
import { Module } from "../../Module";
import { IDatabaseUserStats } from "../../Types";

export default class GatariLeaderboard extends Command {
    constructor(module: Module) {
        super(["lb", "leaderboard"], module, async (ctx, self, args) => {
            if(!ctx.isChat)
                return ctx.reply("Эту команду можно использовать только в беседах!");
            let chat = self.module.bot.maps.getChat(ctx.peerId);
            if(!chat)
                return ctx.reply("Сначала отправьте карту!");
            try {
                let { profiles } = await self.module.bot.vk.api.messages.getConversationMembers({
                    peer_id: ctx.peerId
                });
                let users: IDatabaseUserStats[] = [];
                for(let i = 0; i < profiles.length; i++) {
                    let profile = profiles[i];
                    let user = await self.module.bot.database.servers.gatari.getUser(profile.id);
                    if(user.id && !users.some(u => u.id == user.id))
                        users.push(user);
                }
                users = users.filter(a => a.rank > 0 && a.pp > 0);
                let leaderboard = await self.module.bot.api.gatari.getLeaderboard(chat.map.id.map, users, chat.map.mode);
                ctx.reply(self.module.bot.templates.Leaderboard(leaderboard, self.module.name, self.module.bot.donaters.status.bind(self.module.bot.donaters)));
            } catch(e) {
                ctx.reply("Ошибка!");
            }
        });
    }
}