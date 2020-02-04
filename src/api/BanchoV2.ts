import * as axios from "axios";
import qs from "querystring";
import { EventEmitter } from "events";

interface IAPIData {
    lastBuild: number;
}

export default class BanchoAPIV2 extends EventEmitter {
    api: axios.AxiosInstance;
    data: IAPIData;
    constructor() {
        super();
        this.api = axios.default.create({
            baseURL: "https://osu.ppy.sh/api/v2",
            timeout: 1e4
        });
        this.data = {
            lastBuild: Infinity
        };
    }

    start() {
        setInterval(() => {
            this.getChangelog();
        }, 5000);
    }

    async getChangelog() {
        let { data } = await this.api.get('/changelog');
        let v = data.builds[0];
        if(this.data.lastBuild == Infinity)
            this.data.lastBuild = v.id;
        else if(v.id > this.data.lastBuild) {
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

            this.emit('osu-update', {
                version: v.version,
                changes,
                majors
            });
        }
    }
}