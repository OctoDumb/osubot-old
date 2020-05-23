import { V2Beatmapset, V2News } from "./Types";

interface IOsuUpdate {
    /** New osu! version */ version: string,
    /** Changes sorted by type */ changes: {
        [key: string]: number
    },
    /** Amount of major changes */ majors: number
}

export type APIV2Events = {
    ['osuupdate']: [IOsuUpdate],
    ['newranked']: [V2Beatmapset],
    ['osunews']: [V2News]
}