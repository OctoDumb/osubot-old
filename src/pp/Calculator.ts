import { APITopScore, APIBeatmap, APIRecentScore, APIScore } from '../Types';
import { ICalcStats } from './Stats';
import Mods from './Mods';

interface IPP {
    pp: number,
    fc: number,
    ss: number
}

interface ModePP {
    map: APIBeatmap,
    mods: Mods,
    value: IPP
}

interface IPPCalculator {
    speedMultiplier: number,
    map: APIBeatmap,
    mods: Mods,
    stats: ICalcStats,
    calculate(score: APITopScore | APIRecentScore | APIScore): IPP,
    PP(score: APITopScore | APIRecentScore | APIScore): ModePP
}

export {
    IPP,
    IPPCalculator
}