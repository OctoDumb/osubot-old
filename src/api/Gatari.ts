import IAPI from './base';
import * as axios from 'axios';
import qs from 'querystring';
import { APIUser, APITopScore, HitCounts, APIRecentScore, APIScore } from '../Types';
import Mods from '../pp/Mods';
import Util from '../Util';

class GatariUser implements APIUser {
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
    constructor(user: any, stats: any, api: IAPI) {
        this.api = api;
        this.id = user.id;
        this.nickname = user.username;
        this.playcount = stats.playcount;
        this.playtime = stats.playtime;
        this.pp = stats.pp;
        this.rank = {
            total: stats.rank,
            country: stats.country_rank
        };
        this.country = user.country;
        this.accuracy = stats.avg_accuracy;
        this.level = stats.level;
    }
}

class GatariTopScore implements APITopScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    pp: number;
    mode: number;
    constructor(score: any, api: IAPI) {
        this.api = api;
        this.beatmapId = score.beatmap.beatmap_id;
        this.score = score.score;
        this.combo = score.max_combo;
        this.counts = new HitCounts({
            300: score.count_300,
            100: score.count_100,
            50: score.count_50,
            miss: score.count_miss,
            geki: score.count_gekis,
            katu: score.count_katu
        }, score.play_mode);
        this.mods = new Mods(score.mods);
        this.rank = score.ranking;
        this.pp = score.pp;
        this.mode = score.play_mode;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

class GatariRecentScore implements APIRecentScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    mode: number;
    constructor(data: any, api: IAPI) {
        this.api = api;
        this.beatmapId = data.beatmap.beatmap_id;
        this.score = data.score;
        this.combo = data.max_combo;
        this.counts = new HitCounts({
            300: data.count_300,
            100: data.count_100,
            50: data.count_50,
            miss: data.count_miss,
            geki: data.count_gekis,
            katu: data.count_katu
        }, data.play_mode);
        this.mods = new Mods(data.mods);
        this.rank = data.ranking;
        this.mode = data.play_mode;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

class GatariScore implements APIScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    mode: number;
    rank: string;
    constructor(data: any, id: number, api: IAPI) {
        this.api = api;
        this.beatmapId = id;
        this.score = data.score;
        this.combo = data.max_combo;
        this.counts = new HitCounts({
            300: data.count_300,
            100: data.count_100,
            50: data.count_50,
            miss: data.count_miss
        }, data.play_mode);
        this.mods = new Mods(data.mods);
        this.mode = data.play_mode;
        this.rank = data.rank;
        this.mode = data.play_mode;
    }

    accuracy() {
        return Util.accuracy(this.counts);
    }
}

export default class GatariAPI implements IAPI {
    api: axios.AxiosInstance;
    constructor() {
        this.api = axios.default.create({
            baseURL: "https://api.gatari.pw",
            timeout: 3000
        });
    }

    async getUser(nickname: string, mode: number = 0): Promise<APIUser> {
        try {
            let { data: user } = await this.api.get(`/users/get?${qs.stringify({u: nickname})}`);
            let { data: stats } = await this.api.get(`/user/stats?${qs.stringify({u: nickname, mode: mode})}`);
            if(user.code != 200 || stats.code != 200)
                throw "Unknown API error";
            if(!user.users[0])
                throw "User not found";
            return new GatariUser(user.users[0], stats.stats, this);
        } catch(e) {
            throw e;
        }
    }

    async getUserTop(nickname: string, mode: number = 0, limit: number = 3): Promise<APITopScore[]> {
        try {
            let user = await this.getUser(nickname);
            let { data } = await this.api.get(`/user/scores/best?${qs.stringify({id: user.id, mode: mode, p: 1, l: limit})}`);
            if(!data.scores)
                throw "No scores";
            return data.scores.map(s => new GatariTopScore(s, this));
        } catch (e) {
            throw e;
        }
    }

    async getUserRecent(nickname: string, mode: number = 0): Promise<APIRecentScore> {
        try {
            let user = await this.getUser(nickname);
            let { data } = await this.api.get(`/user/scores/recent?${qs.stringify({id: user.id, mode: mode, p: 1, l: 1, f: 1})}`);
            if(!data.scores[0])
                throw "No scores";
            return new GatariRecentScore(data.scores[0], this);
        } catch (e) {
            throw e;
        }
    }

    async getScore(nickname: string, beatmapId: number, mode: number = 0): Promise<APIScore> {
        if(mode > 1)
            throw "Mode is not supported";
        try {
            let user = await this.getUser(nickname);
            let { data } = await this.api.get(`/beatmap/user/score?${qs.stringify({b: beatmapId, u: user.id, mode: mode})}`);
            if(!data.score)
                throw "No score";
            return new GatariScore(data.score, beatmapId, this);
        } catch (e) {
            throw e;
        }
    }
}