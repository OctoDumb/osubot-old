import ICalc from '../Calculator';
import Mods from '../Mods';
import { TopScore, APIBeatmap, HitCounts, IHits } from '../../Types';
import { ICalcStats } from '../Stats';
import Util from '../../Util';

// function GetStats(stats: IBeatmapStats, mode: number): ICalcStats {
//     switch(mode) {
//         case 1:
//             return new TaikoStats(stats);
//         case 2:
//             return new CatchStats(stats);
//         case 3:
//             return new ManiaStats(stats);
//         default:
//             return new OsuStats(stats);
//     }
// }

class BanchoPP implements ICalc {
    map: APIBeatmap;
    mods: Mods;
    speedMultiplier: number = 1;
    stats: ICalcStats;
    constructor(map: APIBeatmap, mods: Mods) {
        this.init(map, mods);
    }

    init(map: APIBeatmap, mods: Mods): void {
        this.map = map;
        this.mods = mods;
        this.stats = map.stats;
    }

    calculate(score: TopScore) {
        if(this.mods.has("Relax") || this.mods.has("Relax2") || this.mods.has("Autoplay"))
            return {pp: 0, fc: 0, ss: 0};
        
        return {
            pp: this.stdPP(score.combo, score.counts, score.accuracy()),
            fc: 0,
            // fc: this.stdPP(this.map.combo, {
            //     300: score.counts[300],
            //     100: score.counts[100],
            //     50: score.counts[50],
            //     miss: score.counts.miss,
            //     katu: 0,
            //     geki: 0,
            //     totalHits: () => 15,
            //     accuracy: () => {
            //         return score.accuracy()
            //     }
            // }, score.accuracy()),
            ss: 0
        }
    }
    
    stdPP(combo: number, hits: HitCounts, accuracy: number): number {
        // Aim value
        let aimValue = this.map.diff.aim;

        if(this.mods.has("TouchDevice"))
            aimValue = Math.pow(aimValue, 0.8);

        aimValue = Math.pow(5 * Math.max(1, aimValue / 0.0675) - 4, 3) / 1e5;

        let totalObj = this.map.objects.circles + this.map.objects.sliders + this.map.objects.spinners;

        aimValue *= 0.95 + 0.4 * Math.min(1, totalObj / 2e3) +
            (totalObj > 2e3 ? Math.log10(totalObj / 2e3) * 0.5 : 0);

        // aimValue *= lengthBonus;
        
        aimValue *= Math.pow(0.97, hits.miss);

        aimValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        let arFactor = 1;

        if(this.stats.ar > 10.33)
            arFactor += 0.3 * (this.stats.ar - 10.33);
        else if(this.stats.ar < 8)
            arFactor += 0.01 * (8 - this.stats.ar);

        aimValue *= arFactor;

        if(this.mods.has("Hidden"))
            aimValue *= 1.0 + 0.04 * (12 - this.stats.ar);

        if(this.mods.has("Flashlight"))
            aimValue *= 1.0 + 0.35 * Math.min(1, hits.totalHits() / 200) +
                (hits.totalHits() > 200
                    ? 0.3 * Math.min(1, (hits.totalHits() - 200) / 300) + 
                        (hits.totalHits() > 500 ? (hits.totalHits() - 500) / 1200 : 0)
                    : 0);

        aimValue *= 0.5 + accuracy / 2;

        aimValue *= 0.98 + Math.pow(this.stats.od, 2) / 2500;

        // Speed value
        let speedValue = Math.pow(5 * Math.max(1, this.map.diff.speed / 0.0675) - 4, 3) / 1e5;
        
        if(this.stats.ar > 10.33)
            speedValue *= arFactor;

        speedValue *= 0.95 + 0.4 * Math.min(1, hits.totalHits() / 2e3) +
            (hits.totalHits() > 2e3 ? Math.log10(hits.totalHits() / 2e3) * 0.5 : 0);

        // speedValue *= lengthBonus;

        speedValue *= Math.pow(0.97, hits.miss);

        speedValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        if(this.mods.has("Hidden"))
            speedValue *= 1 + 0.04 * (12 - this.stats.ar);

        speedValue *= 0.02 + accuracy;

        speedValue *= 0.96 + (Math.pow(this.stats.od, 2) / 1600);

        // Accuracy value
        let betterAccPerc = 0;
        if(this.map.objects.circles > 0)
            betterAccPerc = Math.max(((hits[300] - (hits.totalHits() - this.map.objects.circles)) * 6 + hits[100] * 2 + hits[50]) / (this.map.objects.circles * 6), 1);

        let accValue = Math.pow(1.52163, this.stats.od) * Math.pow(betterAccPerc, 24) * 2.83;

        accValue *= Math.min(1.15, Math.pow(this.map.objects.circles / 1e3, 0.3));

        if(this.mods.has("Hidden"))
            accValue *= 1.08;
        if(this.mods.has("Flashlight"))
            accValue *= 1.02;

        let multiplier = 1.12;
    
        if(this.mods.has("NoFail"))
            multiplier *= 0.9;
        if(this.mods.has("SpunOut"))
            multiplier *= 0.95;

        return Math.pow(
            Math.pow(aimValue, 1.1) +
            Math.pow(speedValue, 1.1) +
            Math.pow(accValue, 1.1), 1  / 1.1
        ) * multiplier;
    }
}

export default BanchoPP;