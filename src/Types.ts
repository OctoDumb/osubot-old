import { IAPI } from './API';
import Mods from './pp/Mods';
import { ICalcStats } from './pp/Stats';
import Util from './Util';

interface ICommandArgs {
    full: string[];
    string: string[];
    nickname: string[];
    mods: string;
    combo: number;
    acc: number;
    miss: number;
    place: number;
}

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
    katu?: number,
    geki?: number
}

class HitCounts implements IHits {
    300: number;
    100: number;
    50: number;
    miss: number;
    katu?: number;
    geki?: number;
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
        Util.accuracy(this);
    }

    totalHits(): number {
        switch(this.mode) {
            case 1:
                return this[300] + this[100] + this[50] + this.miss;
            case 2:
                return 0;
            case 3: 
                return this.geki + this.katu + this[300] + this[100] + this[50] + this.miss;
            default:
                return this[300] + this[100] + this[50] + this.miss;
        }
    }

    toString(): string {
        switch(this.mode) {
            case 0:
            case 1:
                return `${this[300]}/${this[100]}/${this[50]}/${this.miss}`;

            case 3:
                return `${this.geki}/${this[300]}/${this.katu}/${this[100]}/${this[50]}/${this.miss}`;

            default:
                return '';
        }
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

interface APIUser {
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
}

interface APITopScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    pp: number;
    mode: number;
    accuracy(): number;
}

interface APIScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    mode: number;
    accuracy(): number;
    rank: string;
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
    stats: ICalcStats;
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
        this.stats = Util.getStats({
            cs: Number(data.diff_size),
            od: Number(data.diff_overall),
            ar: Number(data.diff_approach),
            hp: Number(data.diff_drain)
        }, Number(data.mode));
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

interface APIRecentScore {
    api: IAPI;
    beatmapId: number;
    score: number;
    combo: number;
    counts: HitCounts;
    mods: Mods;
    rank: string;
    mode: number;
    accuracy(): number;
}

export {
    APIUser,
    APITopScore,
    APIScore,
    APIBeatmap,
    APIRecentScore,

    BeatmapStatus,
    ProfileMode,
    Mode,
    HitCounts,
    IHits,
    IBeatmapStats,
    IBeatmapStars,
    IBeatmapObjects,

    ICommandArgs
}