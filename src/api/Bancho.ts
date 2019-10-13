import IAPI from './base';
import * as axios from 'axios';
import qs from 'querystring';
import { APIUser, APITopScore, APIBeatmap, APIRecentScore, HitCounts, APIScore } from '../Types';
import Mods from '../pp/Mods';
import Util from '../Util';

class BanchoUser implements APIUser {
    api: IAPI;
    id: number;
    nickname: string;
    playcount: number;
    playtime: number;
    pp: number;
    rank: {
        total: number,
        country: number
    };
    country: string;
    accuracy: number;
    level: number;
    constructor(data: any, api: IAPI) {
        this.api = api;
        this.id = Number(data.user_id);
        this.nickname = data.username;
        this.playcount = Number(data.playcount);
        this.playtime = Number(data.playtime);
        this.pp = Number(data.pp_raw);
        this.rank = {
            total: Number(data.pp_rank),
            country: Number(data.pp_country_rank)
        };
        this.country = data.country;
        this.accuracy = Number(data.accuracy);
        this.level = Number(data.level);
    }
}

class BanchoTopScore implements APITopScore {
    api: IAPI;
    beatmapId: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    pp: number;
    mode: number;
    constructor(data: any, mode: number, api: IAPI) {
        this.api = api;
        this.beatmapId = Number(data.beatmap_id);
        this.combo = Number(data.maxcombo);
        this.counts = new HitCounts({
            300: Number(data.count300),
            100: Number(data.count100),
            50: Number(data.count50),
            miss: Number(data.countmiss),
            katu: Number(data.countkatu),
            geki: Number(data.countgeki)
        }, mode);
        this.mods = new Mods(Number(data.enabled_mods));
        this.rank = data.rank;
        this.pp = Number(data.pp);
        this.mode = mode;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

class BanchoRecentScore implements APIRecentScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    mode: number;
    constructor(data: any, mode: number, api: IAPI) {
        this.api = api;
        this.beatmapId = Number(data.beatmap_id);
        this.score = Number(data.score);
        this.combo = Number(data.maxcombo);
        this.counts = new HitCounts({
            300: Number(data.count300),
            100: Number(data.count100),
            50: Number(data.count50),
            katu: Number(data.countkatu),
            geki: Number(data.countgeki),
            miss: Number(data.countmiss)
        }, mode);
        this.mods = new Mods(Number(data.enabled_mods));
        this.rank = data.rank;
        this.mode = mode;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

class BanchoScore implements APIScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    mode: number;
    rank: string;
    constructor(data: any, mode: number, id: number, api: IAPI) {
        this.api = api;
        this.beatmapId = id;
        this.score = Number(data.score);
        this.combo = Number(data.maxcombo);
        this.counts = new HitCounts({
            300: Number(data.count300),
            100: Number(data.count100),
            50: Number(data.count50),
            katu: Number(data.countkatu),
            geki: Number(data.countgeki),
            miss: Number(data.countmiss)
        }, mode);
        this.mods = new Mods(Number(data.enabled_mods));
        this.rank = data.rank;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

export default class BanchoAPI implements IAPI {
    token: String;
    api: axios.AxiosInstance;
    map: axios.AxiosInstance;
    constructor(token) {
        this.token = token;
        this.api = axios.default.create({
            baseURL: "https://osu.ppy.sh/api",
            timeout: 3000
        });
        this.map = axios.default.create({
            baseURL: "https://osu.ppy.sh/osu/",
            timeout: 6000,
            responseType: "text"
        });
    }

    async getUser(nickname: String, mode: Number = 0): Promise<APIUser> {
        try {
            let { data } = await this.api.get(`/get_user?${qs.stringify({u: nickname, m: mode, k: this.token})}`);
            if(!data[0])
                throw "User not found";
            return new BanchoUser(data[0], this);
        } catch(e) {
            throw e;
        }
    }

    async getUserTop(nickname: String, mode: number = 0, limit: number = 3): Promise<APITopScore[]> {
        try {
            let { data } = await this.api.get(`/get_user_best?${qs.stringify({u: nickname, m: mode, k: this.token, limit: limit})}`);
            return data.map(s => new BanchoTopScore(s, mode, this));
        } catch(e) {
            throw e;
        }
    }

    async getUserRecent(nickname: String, mode: number = 0): Promise<APIRecentScore> {
        try {
            let { data } = await this.api.get(`/get_user_recent?${qs.stringify({u: nickname, m: mode, k: this.token, limit: 1})}`);
            if(data[0])
                return new BanchoRecentScore(data[0], mode, this);
            else
                throw "No recent scores";
        } catch(e) {
            throw e;
        }
    }

    async getScore(nickname: String, beatmapId: number, mode: number = 0, mods: number): Promise<APIScore> {
        let opts = {
            k: this.token,
            u: nickname,
            b: beatmapId,
            m: mode
        };
        try {
            let { data } = await this.api.get(`/get_scores?${qs.stringify(opts)}`);
            if(mods)
                data = data.filter(p => p.enabled_mods == mods);
            if(!data[0])
                throw "No scores found";
            return new BanchoScore(data[0], mode, beatmapId, this);
        } catch(e) {
            throw e || "Unknown API error";
        }
    }

    async getBeatmap(id: number | string, mode: number = 0, mods: number = 0): Promise<APIBeatmap> {
        let opts: any = {
            k: this.token,
            a: 1,
            mode: mode
        };
        if(typeof id == "number")
            opts.b = id;
        else
            opts.h = String(id);
        if(mods)
            opts.mods = mods;
        let { data } = await this.api.get(`/get_beatmaps?${qs.stringify(opts)}`);
        if(!data[0])
            throw "Beatmap not found";
        let beatmap = new APIBeatmap(data[0], this);
        if(mods)
            beatmap.stats.modify(new Mods(mods));
        return beatmap;
    }
}