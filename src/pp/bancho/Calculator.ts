import ICalc from '../Calculator';
import { TopScore, APIBeatmap } from '../../Types';

class BanchoPP implements ICalc {
    constructor(map: APIBeatmap, mods: number) {
        this.init(map, mods);
    }

    init(map: APIBeatmap, mods: number): void {
        //
    }

    calculate(score: TopScore) {
        return {
            pp: 0,
            fc: 0,
            ss: 0
        }
    }
}