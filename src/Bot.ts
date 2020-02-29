import { VK, MessageContext, DocumentAttachment } from 'vk-io';
import { Module } from './Module';
import Database from './Database';
import Bancho from './modules/Bancho';
import { Command } from './Command';
import { APICollection } from './API';
import { Templates, ITemplates } from './templates';
import Maps from './Maps';
import { ReplayParser } from './Replay';
import * as axios from 'axios';
import News from './News';
import Admin from './modules/Admin';
import Main from './modules/Main';
import BanchoPP from './pp/bancho';
import Gatari from './modules/Gatari';
import IsMap from './MapRegexp';
import Ripple from './modules/Ripple';
import Donaters from './Donaters';
import Akatsuki from './modules/Akatsuki';
import AkatsukiRelax from './modules/AkatsukiRelax';
import * as TwitchJs from 'twitch-js';
import Enjuu from './modules/Enjuu';
import OsuTrackAPI from './Track';
import Vudek from './modules/Vudek';
import Kurikku from './modules/Kurikku';
import BanchoV2 from "./api/BanchoV2";
import Util from './Util';
import IgnoreList from './Ignore';

interface IBotConfig {
    vk?: {
        token: string,
        id: number,
        owner: number
    },
    tokens?: {
        bancho: string,
        ripple: string
    },
    osu?: {
        username: string,
        password: string
    },
    twitchId?: string
}

interface TwitchStream {
    url: string;
    title: string;
    viewers: number;
}

export default class Bot {
    config: IBotConfig;
    vk: VK;
    modules: Module[];
    database: Database;
    api: APICollection;
    templates: ITemplates;
    maps: Maps;
    news: News;
    ignored: IgnoreList;
    donaters: Donaters;
    streamers: TwitchStream[];
    twitch: any;
    track: OsuTrackAPI;
    v2: BanchoV2;
    startTime: number;
    totalMessages: number;
    version: string;
    constructor(config: IBotConfig) {
        this.config = config;

        this.vk = new VK({
            token: config.vk.token,
            pollingGroupId: config.vk.id
        });
        this.modules = [];

        this.registerModule([
            new Bancho(this),
            new Gatari(this),
            new Ripple(this),
            new Akatsuki(this),
            new AkatsukiRelax(this),
            new Enjuu(this),
            new Vudek(this),
            new Kurikku(this),
            new Admin(this),
            new Main(this)
        ]);

        this.database = new Database(this.vk);

        this.initDB();

        this.api = new APICollection(this);

        this.templates = Templates;

        this.maps = new Maps(this);

        this.vk.updates.on("message", async (ctx) => {
            if(ctx.isOutbox || ctx.isFromGroup || ctx.isEvent || this.ignored.isIgnored(ctx.senderId))
                return;
            this.totalMessages++;
            let replayDoc = this.checkReplay(ctx);
            let hasMap = this.checkMap(ctx);
            if(replayDoc) {
                try {
                    let { data: file } = await axios.default.get(replayDoc.url, {
                        responseType: "arraybuffer"
                    });
                    let parser = new ReplayParser(file);
                    let replay = parser.getReplay();
                    let map = await this.api.bancho.getBeatmap(replay.beatmapHash);
                    if(replay.mods.diff()) 
                        map = await this.api.bancho.getBeatmap(map.id.map, replay.mode, replay.mods.diff());
                    let cover = await this.database.covers.getCover(map.id.set);
                    let calc = new BanchoPP(map, replay.mods);
                    let keyboard = Util.createKeyboard([['B','s'],['G','g'],['R','r']]
                        .map(s => Array.prototype.concat([{
                            text: `[${s[0]}] Мой скор на карте`,
                            command: `${s[1]} c ${Util.getModeArg(replay.mode)}`
                        }], ctx.isChat ? [{
                            text: `[${s[0]}] Топ чата на карте`,
                            command: `${s[1]} lb ${Util.getModeArg(replay.mode)}`
                        }]:[]))
                    );
                    ctx.reply(this.templates.Replay(replay, map, calc), {
                        attachment: cover,
                        keyboard
                    });
                    this.maps.setMap(ctx.peerId, map);
                } catch(e) {
                    ctx.reply("Произошла ошибка при обработке реплея!");
                }
            } else if(hasMap) {
                this.maps.sendMap(hasMap, ctx);
            } else {
                if(!ctx.hasText) return;
                if(ctx.text.toLowerCase().startsWith("map ")) {
                    this.maps.stats(ctx);
                } else {
                    for(let module of this.modules) {
                        let check = module.checkContext(ctx);
                        if(check) {
                            if(check.map) {
                                let chat = this.maps.getChat(ctx.peerId);
                                if(!chat || chat.map.id.map != check.map) {
                                    let map = await this.api.bancho.getBeatmap(check.map);
                                    this.maps.setMap(ctx.peerId, map);
                                }
                            }
                            check.command.process(ctx);
                        }
                    }
                }
            }
        });

        this.news = new News(this);

        this.ignored = new IgnoreList();

        this.donaters = new Donaters();

        this.streamers = [];

        this.twitch = new TwitchJs.default({
            clientId: config.twitchId,
            log: {
                level: 'error'
            }
        }).api;

        this.updateStreamers();

        this.track = new OsuTrackAPI();

        this.startTime = 0;

        this.totalMessages = 0;

        this.version = require('../../package.json').version;

        this.v2 = new BanchoV2();

        this.v2.on('osuupdate', update => {
            let changesString = [];
            for(let ch in update.changes) {
                changesString.push(`${ch} [${update.changes[ch]}]`);
            }
            this.news.notify({
                message: `🔔 Новое обновление osu! (${update.version})${update.majors ? `\n❗ Есть важные изменения! (${update.majors})` : ""}
                ${changesString.join("\n")}
                https://osu.ppy.sh/home/changelog/stable40/${update.version}`,
                type: 'osuupdate'
            });
        });
    }

    registerModule(module: Module | Module[]) {
        if(Array.isArray(module))
            this.modules.push(...module);
        else
            this.modules.push(module);
    }

    initDB(): void {
        for(let k in this.database.servers) {
            this.database.servers[k].createTables();
        }
        this.database.run("CREATE TABLE IF NOT EXISTS covers (id INTEGER attachment TEXT)");
        this.database.run("CREATE TABLE IF NOT EXISTS errors (code TEXT, info TEXT, error TEXT)");
    }

    async start() {
        await this.vk.updates.start();
        await this.v2.login(
            this.config.osu.username,
            this.config.osu.password
        )
        this.v2.start();
        this.startTime = Date.now();
        console.log('Started');
    }

    async stop() {
        await this.vk.updates.stop();
        console.log('Stopped');
    }

    checkReplay(ctx: MessageContext): DocumentAttachment {
        if(!ctx.hasAttachments("doc"))
            return null;
        return ctx.getAttachments("doc").filter(doc => doc.extension == "osr")[0];
    }

    checkMap(ctx: MessageContext): number {
        let hasMap = IsMap(ctx.text);
        let hasAtt = ctx.hasAttachments("link");
        if(hasMap)
            return hasMap;
        if(hasAtt) {
            let url = ctx.getAttachments("link")[0].url;
            hasMap = IsMap(url);
            if(hasMap)
                return hasMap;
        }
        return null;
    }

    async updateStreamers() {
        try {
            let { streams } = await this.twitch.get('streams', { version: 'kraken', search: { game: 'osu!' } });
            this.streamers = streams.map(s => {
                return {
                    url: s.channel.url,
                    title: s.channel.status,
                    viewers: s.viewers
                };
            });
        } catch (e) {
            console.log(e);
        }
        setTimeout(() => {
            this.updateStreamers();
        }, 30000);
    }
}