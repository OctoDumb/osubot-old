import * as axios from "axios";
import qs from "querystring";
import { EventEmitter } from "eventemitter3";
import { APIV2Events } from "../Events";
import BanchoV2Data from "./BanchoV2Data";
import { V2ChangelogArguments, V2BeatmapsetsArguments, V2ChangelogResponse, V2Beatmapset } from "../Types";

interface IAPIData {
    lastBuild: number;
    lastRanked: number;
}

class BanchoAPIV2 {
    api: axios.AxiosInstance;
    data: BanchoV2Data;
    logged: number;
    token?: string;
    refresh_token?: string;
    constructor() {
        this.api = axios.default.create({
            baseURL: "https://osu.ppy.sh/api/v2",
            timeout: 1e4
        });
        // this.data = {
        //     lastBuild: Infinity,
        //     lastRanked: Infinity
        // };
        this.logged = 0;

        this.data = new BanchoV2Data(this);
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

    startUpdates() {
        setInterval(async() => {
            await this.data.fetch();
        }, 15e3);
    }

    async getChangelog(args: V2ChangelogArguments): Promise<V2ChangelogResponse[]> {
        let data = (await this.request('/changelog', { stream: args.stream || "stable40", limit: args.limit })).builds;
        return data.map(build => ({
            id: build.id,
            version: build.version,
            entries: build.changelog_entries.map(entry => ({
                category: entry.category,
                title: entry.title,
                isMajor: entry.major
            }))
        }));
    }

    // async getChangelog() {
    //     let data = await this.request('/changelog', { stream: "stable40" });
    //     let v = data.builds[0];
    //     if(this.data.lastBuild == Infinity)
    //         this.data.lastBuild = v.id;
    //     else if(v.id > this.data.lastBuild) {
    //         this.data.lastBuild = v.id;
    //         let changes = {};
    //         let majors = 0;
    //         for(let change of v.changelog_entries) {
    //             if(changes[change.category])
    //                 changes[change.category]++;
    //             else
    //                 changes[change.category] = 1;
    //             if(change.major)
    //                 majors++;
    //         }

    //         this.emit('osuupdate', {
    //             version: v.version,
    //             changes,
    //             majors
    //         });
    //     }
    // }

    async getBeatmapsets(args: V2BeatmapsetsArguments): Promise<V2Beatmapset[]> {
        let data = (await this.request('/beatmapsets/search/', { q: args.query || null, s: args.status || 'ranked', limit: args.limit || 5 }));
        return data.beatmapsets.map(set => ({
            id: set.id,
            title: set.title,
            artist: set.artist,
            rankedDate: new Date(set.ranked_date),
            creator: set.creator,
            status: set.status,
            beatmaps: set.beatmaps.map(map => ({
                id: map.id,
                mode: map.mode_int,
                stars: map.difficulty_rating,
                version: map.version
            }))
        }));
        // if(this.data.lastRanked == Infinity)
        //     this.data.lastRanked = new Date(data[0].ranked_date).getTime();
        // else {
        //     data = data.filter(s => new Date(s.ranked_date).getTime() > this.data.lastRanked).reverse();
        //     if(!data.length) return;
        //     for(let i = 0; i < data.length; i++) {
        //         let set = data[i];
        //         // this.emit('newranked', {
        //         //     id: set.id,
        //         //     title: set.title,
        //         //     artist: set.artist,
        //         //     creator: set.creator,
        //         //     preview: set.preview_url,
        //         //     maps: set.beatmaps
        //         // });
        //     }
        //     this.data.lastRanked = new Date(data[0].ranked_date).getTime();
        // }
    }
}

export default BanchoAPIV2;
