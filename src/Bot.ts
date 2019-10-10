import { VK } from 'vk-io';
import { Module } from './Module';
import Database from './Database';
import Bancho from './modules/Bancho';
import { Command } from './Command';
import { APICollection } from './API';
import * as Templates from './templates';
import Maps from './Maps';

interface IBotConfig {
    vk: {
        token: string,
        id: number
    },
    tokens: {
        bancho: string,
        ripple: string
    }
}

interface ITemplates {
    UserTemplate: typeof Templates.UserTemplate,
    TopScoreTemplate: typeof Templates.TopScoreTemplate,
    RecentScoreTemplate: typeof Templates.RecentScoreTemplate
}

export default class Bot {
    config: IBotConfig;
    vk: VK;
    modules: Module[];
    database: Database;
    api: APICollection;
    templates: ITemplates;
    maps: Maps;
    constructor(config: IBotConfig) {
        this.config = config;

        this.vk = new VK({
            token: config.vk.token,
            pollingGroupId: config.vk.id
        });
        this.modules = [];

        this.registerModule([
            new Bancho(this)
        ]);

        this.database = new Database(this.vk);

        this.vk.updates.on("message", (ctx) => {
            if(ctx.isOutbox)
                return;
            for(let module of this.modules) {
                let check: Command = module.checkContext(ctx);
                if(check) {
                    check.process(ctx);
                }
            }
        });

        this.api = new APICollection(this);

        this.templates = Templates;

        this.maps = new Maps(this);
    }

    registerModule(module: Module | Module[]) {
        if(Array.isArray(module))
            this.modules.push(...module);
        else
            this.modules.push(module);
    }

    async start() {
        await this.vk.updates.start();
        console.log('Started');
    }

    async stop() {
        await this.vk.updates.stop();
        console.log('Stopped');
    }
}