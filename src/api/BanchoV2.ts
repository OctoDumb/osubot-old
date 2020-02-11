import * as axios from "axios";
import qs from "querystring";
import { EventEmitter } from "eventemitter3";
import { APIV2Events } from "../Events";

interface IAPIData {
    lastBuild: number;
    lastRanked: number;
}

class BanchoAPIV2 extends EventEmitter<APIV2Events> {
    api: axios.AxiosInstance;
    data: IAPIData;
    logged: number;
    token?: string;
    refresh_token?: string;
    constructor() {
        super();
        this.api = axios.default.create({
            baseURL: "https://osu.ppy.sh/api/v2",
            timeout: 1e4
        });
        this.data = {
            lastBuild: Infinity,
            lastRanked: Infinity
        };
        this.logged = 0;
    }

    async login(username: string, password: string) {
        let { data } = await axios.default.post(`https://osu.ppy.sh/oauth/token`, {
            username,
            password,
            grant_type: "password",
            client_id: 5,
            client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
            scope: "*"
        });
        if(!data.access_token)
            return this.logged = -1;
        this.token = data.access_token;
        this.refresh_token = data.refresh_token;
        return this.logged = 1;
    }

    async request(method: string, query?: {[key: string]: any}) {
        try {
            let { data } = await this.api.get(`${method}${query ? `?${qs.stringify(query)}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return data;
        } catch(e) {
            if(e.response.status == 401) {
                await this.refresh();
                return this.request(method, query);
            }
            throw e;
        }
    }

    async refresh() {
        if(this.logged != 1)
            throw "Not logged in";
        let { data } = await axios.default.post(`https://osu.ppy.sh/oauth/token`, {
            client_id: 5,
            client_secret: "FGc9GAtyHzeQDshWP5Ah7dega8hJACAJpQtw6OXk",
            grant_type: "refresh_token",
            refresh_token: this.refresh_token,
            scope: "*"
        });
        this.token = data.access_token;
        this.refresh_token = data.refresh_token;
        return true;
    }

    start() {
        setInterval(() => {
            this.getChangelog();
        }, 5000);
    }

    async getChangelog() {
        let data = await this.request('/changelog', { stream: "stable40" });
        let v = data.builds[0];
        if(this.data.lastBuild == Infinity)
            this.data.lastBuild = v.id;
        else if(v.id > this.data.lastBuild) {
            this.data.lastBuild = v.id;
            let changes = {};
            let majors = 0;
            for(let change of v.changelog_entries) {
                if(changes[change.category])
                    changes[change.category]++;
                else
                    changes[change.category] = 1;
                if(change.major)
                    majors++;
            }

            this.emit('osuupdate', {
                version: v.version,
                changes,
                majors
            });
        }
    }

    // async getBeatmapsets() {
    //     let data = await this.request('/beatmapsets/search', { s: 'ranked', limit: 1 });
    //     return data;
    // }
}

/**
 * An osu! update event
 * @event BanchoAPIV2#osuupdate
 * @type {object}
 * @property {string} version 
 * @property {[key: string]: number} changes 
 * @property {number} majors 
 */

export default BanchoAPIV2;