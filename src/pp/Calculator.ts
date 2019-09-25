import { TopScore, APIBeatmap } from '../Types';

interface IPP {
    pp: number,
    fc: number,
    ss: number
}

export default interface IPPCaltulator {
    init(map: APIBeatmap, mods: number): void,
    calculate(score: TopScore): IPP
}