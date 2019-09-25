import { IAPI } from './API';

enum BeatmapStatus {
    Graveyard = -2,
    WIP = -1,
    Pending = 0,
    Ranked = 1,
    Approved = 2,
    Qualified = 3,
    Loved = 4
}

enum ProfileMode {
    STD,
    Taiko,
    Catch,
    Mania
}

enum Mode {
    "osu!",
    "osu!taiko",
    "osu!catch",
    "osu!mania"
}

interface IHits {
    300: number,
    100: number,
    50: number,
    miss: number,
    katu: number,
    geki: number
}

class HitCounts implements IHits {
    hits: IHits;
    300: number;
    100: number;
    50: number;
    miss: number;
    katu: number;
    geki: number;
    mode: number;
    constructor(hits: IHits, mode: number) {
        this[300] = hits[300];
        this[100] = hits[100];
        this[50] = hits[50];
        this.miss = hits.miss;
        this.katu = hits.katu;
        this.geki = hits.geki;
        this.mode = mode;
    }

    accuracy() {
        //
    }
}

interface IBeatmapStats {
    cs: number;
    od: number;
    ar: number;
    hp: number;
}

interface IBeatmapStars {
    stars: number;
    aim: number;
    speed: number;
}

interface IBeatmapObjects {
    circles: number;
    sliders: number;
    spinners: number;
}

class User {
    api: IAPI;
    id: number;
    nickname: String;
    playcount: number;
    playtime: number;
    pp: number;
    rank: {
        total: number,
        country: number
    };
    country: String;
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

class TopScore {
    api: IAPI;
    beatmapId: number;
    combo: number;
    counts: HitCounts;
    mods: number;
    rank: String;
    pp: number;
    constructor(data: any, mode: number, api: IAPI) {
        this.api = api;
        this.beatmapId = Number(data.beatmap_id);
        this.combo = Number(data.maxcombo);
        this.counts = new HitCounts({
            300: Number(data.count300),
            100: Number(data.count100),
            50: Number(data.count50),
            miss: Number(data.countmiss),
            katu: Number(data.countkatu),
            geki: Number(data.countgeki)
        }, mode);
        this.mods = Number(data.enabled_mods);
        this.rank = data.rank;
        this.pp = Number(data.pp);
    }
}

class APIBeatmap {
    api: IAPI;
    artist: string;
    id: {
        set: number;
        map: number;
    };
    bpm: number;
    creator: {
        nickname: string;
        id: number;
    };
    status: string;
    stats: IBeatmapStats;
    diff: IBeatmapStars;
    objects: IBeatmapObjects;
    title: string;
    length: number;
    version: string;
    combo: number;
    mode: number;
    constructor(data: any, api: IAPI) {
        this.api = api;
        this.artist = data.artist;
        this.id = {
            set: Number(data.beatmapset_id),
            map: Number(data.beatmap_id)
        };
        this.bpm = Number(data.bpm);
        this.creator = {
            nickname: data.creator,
            id: Number(data.creator_id)
        };
        this.status = BeatmapStatus[Number(data.approved)];
        this.stats = {
            cs: Number(data.diff_size),
            od: Number(data.diff_overall),
            ar: Number(data.diff_approach),
            hp: Number(data.diff_drain)
        };
        this.diff = {
            stars: Number(data.difficultyrating),
            aim: Number(data.diff_aim),
            speed: Number(data.diff_speed)
        };
        this.objects = {
            circles: Number(data.count_normal),
            sliders: Number(data.count_slider),
            spinners: Number(data.count_spinner)
        };
        this.title = data.title;
        this.length = Number(data.total_length);
        this.version = data.version;
        this.combo = Number(data.max_combo);
        this.mode = Number(data.mode);
    }
}

export {
    User,
    TopScore,
    APIBeatmap,

    BeatmapStatus,
    ProfileMode,
    Mode,
    HitCounts
}