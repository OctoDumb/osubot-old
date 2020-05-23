import Bot from "./Bot";
import fs from 'fs';

interface INewsRules {
    [id: number]: INewsRule
}

interface INewsRule {
    group: boolean;
    osuupdate: boolean;
    newranked: boolean;
    news: boolean;
}

interface INotifyOptions {
    message?: string;
    attachment?: string;
    type: string;
}

export default class News {
    bot: Bot;
    rules: INewsRules;
    limit: number;
    chatsDefaults: INewsRule;
    usersDefaults: INewsRule;
    constructor(bot: Bot) {
        this.bot = bot;
        if(!fs.existsSync("./news_rules.json"))
            fs.writeFileSync("./news_rules.json", "{}");
        this.rules = JSON.parse(fs.readFileSync("./news_rules.json").toString());
        this.limit = 200;

        this.chatsDefaults = {
            group: true,
            osuupdate: false,
            newranked: false,
            news: true
        }

        this.usersDefaults = {
            group: false,
            osuupdate: false,
            newranked: false,
            news: false
        }

        setInterval(() => {
            this.save();
        }, 3e3);
    }
    
    async notify(options: INotifyOptions) {
        let ids = [];
        for(let i = 1; i <= this.limit; i++)
            ids.push(2000000000 + i);
        ids = ids.filter(id => this.chatAllowed(id, options.type));
        if(ids.length) {
            for(let i = 0; i < Math.ceil(ids.length / 25); i++) {
                try {
                    if(ids[0]) {
                        let code = ids.splice(0, 25).map(id => `API.messages.send(${JSON.stringify({peer_id: id, message: options.message, random_id: Math.ceil(Math.random() * 1e7), attachment: options.attachment || "", dont_parse_links: 1})});`).join("\n");
                        this.bot.vk.api.execute({ code });
                    }
                } catch(e) {
                    console.log(e);
                }
            }
        }
        let rawUsers = (await this.bot.vk.api.execute({ code: 'var i = 0;\nvar users = [];\nwhile(i < 25) {\nvar u = API.messages.getConversations({"count": 200, "offset": 200 * i}).items@.conversation@.peer@.id;\nusers.push(u);\ni = i + 1;\nif(u.length < 200) {\ni = 25;\n}\n}\nreturn users;' })).response;
        let users = [];
        for(let i = 0; i < rawUsers.length; i++) {
            users.push(...rawUsers[i]);
        }
        users = users.filter(u => this.userAllowed(u, options.type));
        if(users.length) {
            for(let i = 0; i < Math.ceil(users.length / 25); i++) {
                try {
                    if(users[0]) {
                        let code = users.splice(0, 25).map(id => `API.messages.send(${JSON.stringify({peer_id: id, message: options.message, random_id: Math.ceil(Math.random() * 1e7), attachment: options.attachment || "", dont_parse_links: 1})});`).join("\n");
                        this.bot.vk.api.execute({ code });
                    }
                } catch(e) {
                    console.log(e);
                }
            }
        }
        return true;
    }

    getChatRules(id: number): INewsRule {
        return Object.assign({}, this.chatsDefaults, this.rules[id] || {});
    }

    getUserRules(id: number): INewsRule {
        return Object.assign({}, this.usersDefaults, this.rules[id] || {});
    }

    save() {
        fs.writeFileSync("./news_rules.json", JSON.stringify(this.rules, null, "\t"));
    }

    chatAllowed(id: number, type: string): boolean {
        return this.getChatRules(id)[type];
    }

    chatSwitch(id: number, type: string): boolean {
        let r = this.getChatRules(id);
        this.rules[id] = r;
        this.rules[id][type] = !r[type];
        return this.rules[id][type];
    }

    userAllowed(id: number, type: string): boolean {
        return this.getUserRules(id)[type];
    }

    userSwitch(id: number, type: string): boolean {
        let r = this.getUserRules(id);
        this.rules[id] = r;
        this.rules[id][type] = !r[type];
        return this.rules[id][type];
    }
}