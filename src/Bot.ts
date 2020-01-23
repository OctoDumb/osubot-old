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

interface IBotConfig {
    vk: {
        token: string,
        id: number,
        owner: number
    },
    tokens: {
        bancho: string,
        ripple: string
    },
    twitchId: string
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
    donaters: Donaters;
    streamers: TwitchStream[];
    twitch: any;
    track: OsuTrackAPI;
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
            if(ctx.isOutbox || ctx.isFromGroup || ctx.isEvent)
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
                    ctx.reply(this.templates.Replay(replay, map, calc), {
                        attachment: cover
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
                        let check: Command = module.checkContext(ctx);
                        if(check) {
                            check.process(ctx);
                        }
                    }
                }
            }
        });

        this.news = new News(this);

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
            return null;
        }
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