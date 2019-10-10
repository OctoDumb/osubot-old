import Bot from "./Bot";
import { MessageContext } from "vk-io";
import { APIBeatmap } from "./Types";

interface Chat {
    id: number;
    map: APIBeatmap;
}

export default class Maps {
    bot: Bot; 
    chats: Chat[];
    constructor(bot: Bot) {
        this.bot = bot;
        this.chats = [];
    }

    getChat(id: number): Chat {
        return this.chats.find(chat => chat.id == id);
    }

    setMap(id: number, map: APIBeatmap) {
        if(!this.getChat(id))
            return this.chats.push({
                id: id,
                map: map
            });
        let index = this.chats.findIndex(chat => chat.id == id);
        this.chats[index].map = map;
    }

    async sendMap(beatmapId: number, ctx: MessageContext) {
        let map = await this.bot.api.bancho.getBeatmap(beatmapId);
        this.setMap(ctx.peerId, map);
        ctx.reply("Карта установлена");
    }
}