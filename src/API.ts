import Bot from './Bot';
import * as axios from 'axios';
import qs from 'querystring';
import { User, TopScore, APIBeatmap } from './Types';
import Mods from './pp/Mods';

interface IAPI {
    token?: String,
    api: axios.AxiosInstance
}

class BanchoAPI implements IAPI {
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

    async getUser(nickname: String, mode: Number = 0): Promise<User> {
        try {
            let { data } = await this.api.get(`/get_user?${qs.stringify({u: nickname, m: mode, k: this.token})}`);
            if(!data[0])
                throw "User not found";
            return new User(data[0], this);
        } catch(e) {
            throw e;
        }
    }

    async getUserTop(nickname: String, mode: number = 0, limit: number = 3): Promise<TopScore[]> {
        try {
            let { data } = await this.api.get(`/get_user_best?${qs.stringify({u: nickname, m: mode, k: this.token, limit: limit})}`);
            return data.map(s => new TopScore(s, mode, this));
        } catch(e) {
            throw e;
        }
    }

    async getBeatmap(id: number | string, mode: number = 0, mods: number = 0) {
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
        return beatmap
    }
}

class APICollection {
    bancho: BanchoAPI;
    constructor(bot: Bot) {
        this.bancho = new BanchoAPI(bot.config.tokens.bancho);
    }
}

export {
    IAPI,
    APICollection
}