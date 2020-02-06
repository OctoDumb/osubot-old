interface IOsuUpdate {
    /** New osu! version */ version: string,
    /** Changes sorted by type */ changes: {
        [key: string]: number
    },
    /** Amount of major changes */ majors: number
}

interface INewRanked {

}

export type APIV2Events = {
    ['osuupdate']: [IOsuUpdate],
    ['newranked']: [INewRanked]
}