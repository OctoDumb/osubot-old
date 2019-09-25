import { VK } from 'vk-io';
import { Module } from './Module';
import Database from './Database';
import Bancho from './modules/Bancho';
import { Command } from './Command';
import { APICollection } from './API';
import * as Templates from './templates';

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
    TopScoreTemplate: typeof Templates.TopScoreTemplate
}

export default class Bot {
    config: IBotConfig;
    vk: VK;
    modules: Module[];
    database: Database;
    api: APICollection;
    templates: ITemplates;
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

        this.initDB();

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
    }

    registerModule(module: Module | Module[]) {
        if(Array.isArray(module))
            this.modules.push(...module);
        else
            this.modules.push(module);
    }

    initDB() {
        let requests = [
            // Servers
            this.database.run("CREATE TABLE IF NOT EXISTS bancho (id INTEGER, uid INTEGER, mode INTEGER, pp REAL DEFAULT 0, rank INTEGER DEFAULT 999999, acc REAL DEFAULT 100)"),
            this.database.run("CREATE TABLE IF NOT EXISTS gatari (id INTEGER, uid INTEGER, mode INTEGER, pp REAL DEFAULT 0, rank INTEGER DEFAULT 999999, acc REAL DEFAULT 100)"),
            this.database.run("CREATE TABLE IF NOT EXISTS ripple (id INTEGER, uid INTEGER, mode INTEGER, pp REAL DEFAULT 0, rank INTEGER DEFAULT 999999, acc REAL DEFAULT 100)"),
            this.database.run("CREATE TABLE IF NOT EXISTS akatsuki (id INTEGER, uid INTEGER, mode INTEGER, pp REAL DEFAULT 0, rank INTEGER DEFAULT 999999, acc REAL DEFAULT 100)"),
            // Cover
            this.database.run("CREATE TABLE IF NOT EXISTS covers (id INTEGER attachment TEXT)"),
            // Errors
            this.database.run("CREATE TABLE IF NOT EXISTS errors (code TEXT, info TEXT, error TEXT)")
        ];
        Promise.all(requests);
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