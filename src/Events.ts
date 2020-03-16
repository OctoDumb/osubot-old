interface IOsuUpdate {
    /** New osu! version */ version: string,
    /** Changes sorted by type */ changes: {
        [key: string]: number
    },
    /** Amount of major changes */ majors: number
}

interface INewRanked {
    id: number,
    title: string,
    artist: string,
    creator: string,
    preview: string,
    maps: any[]
}

export type APIV2Events = {
    ['osuupdate']: [IOsuUpdate],
    ['newranked']: [INewRanked]
}