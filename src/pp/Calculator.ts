import { TopScore, APIBeatmap } from '../Types';
import { ICalcStats } from './Stats';
import Mods from './Mods';

interface IPP {
    pp: number,
    fc: number,
    ss: number
}

export default interface IPPCaltulator {
    speedMultiplier: number,
    map: APIBeatmap,
    mods: Mods,
    stats: ICalcStats,
    init(map: APIBeatmap, mods: number): void,
    calculate(score: TopScore): IPP
}