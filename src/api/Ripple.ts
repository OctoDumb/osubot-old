import IAPI from "./base";
import * as axios from "axios";
import { APIUser, APITopScore, HitCounts, APIRecentScore, APIScore } from "../Types";
import qs from "querystring";
import Util from "../Util";
import Mods from "../pp/Mods";
import { isNullOrUndefined } from "util";

class RippleUser implements APIUser {
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

class RippleTopScore implements APITopScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    pp: number;
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

class RippleRecentScore implements APIRecentScore {
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

class RippleScore implements APIScore {
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

export default class RippleAPI implements IAPI {
    api: axios.AxiosInstance
    constructor() {
        this.api = axios.default.create({
            baseURL: "https://ripple.moe/api",
            timeout: 3000
        });
    }

    async getUser(nickname: string, mode: number = 0): Promise<APIUser> {
        try {
            let { data } = await this.api.get(`/get_user?${qs.stringify({u: nickname, m: mode})}`);
            if(!data[0])
                throw "User not found";
            return new RippleUser(data[0], this);
        } catch(e) {
            throw e;
        }
    }

    async getUserTop(nickname: string, mode: number = 0, limit: number = 3): Promise<APITopScore[]> {
        try {
            let { data } = await this.api.get(`/get_user_best?${qs.stringify({u: nickname, m: mode, limit: limit})}`);
            return data.map(s => new RippleTopScore(s, mode, this));
        } catch(e) {
            throw e;
        }
    }

    async getUserRecent(nickname: string, mode: number = 0): Promise<APIRecentScore> {
        try {
            let { data } = await this.api.get(`/get_user_recent?${qs.stringify({u: nickname, m: mode, limit: 1})}`);
            if(data[0])
                return new RippleRecentScore(data[0], mode, this);
            else
                throw "No recent scores";
        } catch(e) {
            throw e;
        }
    }

    async getScore(nickname: string, beatmapId: number, mode: number = 0, mods: number): Promise<APIScore> {
        let opts = {
            u: nickname,
            b: beatmapId,
            m: mode
        };
        try {
            let { data } = await this.api.get(`/get_scores?${qs.stringify(opts)}`);
            if(!isNullOrUndefined(mods))
                data = data.filter(p => p.enabled_mods == mods);
            if(!data[0])
                throw "No scores found";
            return new RippleScore(data[0], mode, beatmapId, this);
        } catch(e) {
            throw e || "Unknown API error";
        }
    }
}