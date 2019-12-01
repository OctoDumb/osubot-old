import Bot from "./Bot";
import fs from 'fs';
import Util from "./Util";

export default class News {
    bot: Bot;
    forbidden: number[];
    limit: number;
    constructor(bot: Bot) {
        this.bot = bot;
        if(!fs.existsSync("./news_forbidden.json"))
            fs.writeFileSync("./news_forbidden.json", "[]");
        this.forbidden = JSON.parse(fs.readFileSync("./news_forbidden.json").toString());
        this.limit = 200;

        setInterval(() => {
            this.save();
        }, 10000);
    }
    
    async notify(message: string, attachment?: string) {
        for(let i = 0; i < Math.ceil(this.limit / 25); i++) {
            try {
                let ids = [];
                for(let j = 1; j <= 25; j++)
                    ids.push(2000000000 + (i*25) + j);
                ids.filter(id => !this.forbidden.includes(id));
                let code = ids.map(id => `API.messages.send(${JSON.stringify({peer_id: id, message, attachment: attachment || ""})});`).join("\n");
                await this.bot.vk.api.execute({ code });
            } catch(e) {
                //
            }
        }
        // for(let i = 1; i < 2e3; i++) {
        //     try {
        //         // Check if chat exists
        //         await this.bot.vk.api.messages.getConversationsById({
        //             peer_ids: 2000000000 + i
        //         });
                
        //         // Send only if allowed
        //         if(this.allowed(2000000000 + i)) {
        //             let sent = await this.send(2000000000 + i, message, attachment);
        //             console.log(sent ?
        //                 "Sent to " + String(2000000000 + i) :
        //                 "Not sent to " + String(2000000000 + i)
        //             );
        //         }
        //         await Util.sleep(100);
        //     } catch(e) {
        //         console.log("News sent!");
        //         break;
        //     }
        // }
        return true;
    }

    // async send(id: number, message: string, attachment?: string): Promise<boolean> {
    //     try {
    //         await this.bot.vk.api.messages.send({
    //             peer_id: id,
    //             message,
    //             attachment
    //         });
    //         return true;
    //     } catch(e) {
    //         return false;
    //     }
    // }

    save() {
        fs.writeFileSync("./news_forbidden.json", JSON.stringify(this.forbidden, null, "\t"));
    }

    allowed(id: number): boolean {
        return !this.forbidden.includes(id);
    }

    switch(id: number): boolean {
        if(this.allowed(id)) {
            this.forbidden.push(id);
            return false;
        } else {
            this.forbidden.splice(this.forbidden.indexOf(id), 1);
            return true;
        }
    }
}