import Bot from "./Bot";
import fs from 'fs';

interface INewsRules {
    [id: number]: INewsRule
}

interface INewsRule {
    group: boolean;
    osuupdate: boolean;
}

interface INotifyOptions {
    message: string;
    attachment?: string;
    type: string;
}

export default class News {
    bot: Bot;
    rules: INewsRules;
    limit: number;
    defaults: INewsRule;
    constructor(bot: Bot) {
        this.bot = bot;
        if(!fs.existsSync("./news_rules.json"))
            fs.writeFileSync("./news_rules.json", "{}");
        this.rules = JSON.parse(fs.readFileSync("./news_rules.json").toString());
        this.limit = 200;

        this.defaults = {
            group: true,
            osuupdate: false
        };

        setInterval(() => {
            this.save();
        }, 10000);
    }
    
    async notify(options: INotifyOptions) {
        for(let i = 0; i < Math.ceil(this.limit / 25); i++) {
            try {
                let ids = [];
                for(let j = 1; j <= 25; j++)
                    ids.push(2000000000 + (i*25) + j);
                ids = ids.filter(id => this.allowed(id, options.type));
                if(ids[0]) {
                    let code = ids.map(id => `API.messages.send(${JSON.stringify({peer_id: id, message: options.message, random_id: 2281337, attachment: options.attachment || "", dont_parse_links: 1})});`).join("\n");
                    await this.bot.vk.api.execute({ code });
                }
            } catch(e) {
                console.log(e);
            }
        }
        return true;
    }

    getChatRules(id: number): INewsRule {
        return this.rules[id] || this.defaults;
    }

    save() {
        fs.writeFileSync("./news_rules.json", JSON.stringify(this.rules, null, "\t"));
    }

    allowed(id: number, type: string): boolean {
        return this.getChatRules(id)[type];
    }

    switch(id: number, type: string): boolean {
        let r = this.getChatRules(id);
        this.rules[id] = r;
        this.rules[id][type] = !r[type];
        return !r[type];
    }
}