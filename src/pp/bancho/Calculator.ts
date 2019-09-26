import ICalc from '../Calculator';
import Mods from '../Mods';
import { TopScore, APIBeatmap, IBeatmapStats } from '../../Types';
import { ICalcStats, OsuStats, TaikoStats, CatchStats, ManiaStats } from '../Stats';

function GetStats(stats: IBeatmapStats, mode: number): ICalcStats {
    switch(mode) {
        case 1:
            return new TaikoStats(stats);
        case 2:
            return new CatchStats(stats);
        case 3:
            return new ManiaStats(stats);
        default:
            return new OsuStats(stats);
    }
}

class BanchoPP implements ICalc {
    map: APIBeatmap;
    mods: Mods;
    speedMultiplier: number = 1;
    stats: ICalcStats;
    constructor(map: APIBeatmap, mods: number) {
        this.init(map, mods);
    }

    init(map: APIBeatmap, mods: number): void {
        this.map = map;
        this.mods = new Mods(mods);
        this.stats = GetStats(map.stats, map.mode);
    }

    calculate(score: TopScore) {
        return {
            pp: 0,
            fc: 0,
            ss: 0
        }
    }
}