import * as axios from "axios";
import qs from "querystring";
import { EventEmitter } from "eventemitter3";
import { APIV2Events } from "../Events";
import BanchoV2Data from "./BanchoV2Data";
import { V2ChangelogArguments, V2BeatmapsetsArguments, V2ChangelogResponse, V2Beatmapset, V2News } from "../Types";

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

    async getBeatmapsets(args: V2BeatmapsetsArguments): Promise<V2Beatmapset[]> {
        let data = await this.request('/beatmapsets/search/', { q: args.query || null, s: args.status || 'ranked', limit: args.limit || 5 });
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
    }

    async getNews(): Promise<V2News> {
        let data = (await this.request('/news')).news_posts[0];
        return {
            id: data.id,
            author: data.author,
            image: data.first_image.startsWith("/") ? "https://osu.ppy.sh" + data.first_image : data.first_image,
            title: data.title,
            link: "https://osu.ppy.sh/home/news/" + data.slug,
            date: new Date(data.published_at)
        };
    }
}

export default BanchoAPIV2;
