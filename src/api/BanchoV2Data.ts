import BanchoAPIV2 from "./BanchoV2";
import { EventEmitter } from "eventemitter3";
import { APIV2Events } from "../Events";

interface IV2Data {
    lastBuild: number;
    lastRanked: number;
    lastNews: number;
}

export default class BanchoV2Data extends EventEmitter<APIV2Events> {
    api: BanchoAPIV2;
    data: IV2Data;
    constructor(api: BanchoAPIV2) {
        super();
        this.api = api;
        this.data = {
            lastBuild: Infinity,
            lastRanked: Infinity,
            lastNews: 0
        }
    }

    async fetch() {
        await this.updateChangelog();
        await this.updateRanked();
        await this.updateNews();
    }

    async updateChangelog() {
        let builds = await this.api.getChangelog({ });
        let v = builds[0];
        if(this.data.lastBuild == Infinity)
            this.data.lastBuild = v.id;
        else if(v.id > this.data.lastBuild) {
            this.data.lastBuild = v.id;
            let changes = {};
            let majors = 0;
            for(let change of v.entries) {
                if(changes[change.category])
                    changes[change.category]++;
                else
                    changes[change.category] = 1;
                if(change.isMajor)
                    majors++;
            }

            this.emit('osuupdate', {
                version: v.version,
                changes,
                majors
            });
        }
    }

    async updateRanked() {
        let data = await this.api.getBeatmapsets({ status: 'ranked' });
        if(this.data.lastRanked == Infinity)
            this.data.lastRanked = data[0].rankedDate.getTime();
        else {
            data = data.filter(s => s.rankedDate.getTime() > this.data.lastRanked).reverse();
            if(!data.length) return;
            for(let i = 0; i < data.length; i++) {
                let set = data[i];
                this.emit('newranked', set);
            }
            this.data.lastRanked = data[0].rankedDate.getTime();
        }
    }

    async updateNews() {
        let news = await this.api.getNews();
        if(this.data.lastNews == 0)
            this.data.lastNews = news.date.getTime();
        else if(this.data.lastNews < news.date.getTime()) {
            this.data.lastNews = news.date.getTime();
            this.emit('osunews', news);
        }
    }
}