import ICalc from '../Calculator';
import Mods from '../Mods';
import { APITopScore, APIRecentScore, APIBeatmap, HitCounts, APIScore } from '../../Types';
import { ICalcStats } from '../Stats';
import Util from '../../Util';

interface IPP {
    pp: number,
    fc: number,
    ss: number
}

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

    calculate(score: APITopScore | APIRecentScore | APIScore) {
        if(this.mods.has("Relax") || this.mods.has("Relax2") || this.mods.has("Autoplay"))
            return {pp: 0, fc: 0, ss: 0};
        
        return this.stdPP(score).value
    }

    stdPP(score: APITopScore | APIRecentScore | APIScore): BanchoStd {
        return new BanchoStd(this.map, score);
    }
}

class BanchoStd {
    map: APIBeatmap;
    mods: Mods;
    value: IPP;
    constructor(map: APIBeatmap, score: APITopScore | APIRecentScore | APIScore) {
        this.map = map;
        this.mods = score.mods;

        let totalObj = this.map.objects.circles + this.map.objects.sliders + this.map.objects.spinners;

        let multiplier = 1.12;
        if(this.mods.has("NoFail"))
            multiplier *= 0.9;
        if(this.mods.has("SpunOut"))
            multiplier *= 0.95;

        let aimV1 = this.aimValue(score.combo, score.accuracy(), score.counts.miss, score.counts.totalHits());
        let speedV1 = this.speedValue(score.combo, score.accuracy(), score.counts.miss, score.counts.totalHits());
        let accV1 = this.accValue(score.accuracy(), score.counts.miss, totalObj);

        let pp = Math.pow(
            Math.pow(aimV1, 1.1) +
            Math.pow(speedV1, 1.1) +
            Math.pow(accV1, 1.1),
            1 / 1.1
        ) * multiplier;

        let aimV2 = this.aimValue(map.combo, score.accuracy(), 0, totalObj);
        let speedV2 = this.speedValue(map.combo, score.accuracy(), 0, totalObj);
        let accV2 = this.accValue(score.accuracy(), 0, totalObj);

        let fc = Math.pow(
            Math.pow(aimV2, 1.1) +
            Math.pow(speedV2, 1.1) +
            Math.pow(accV2, 1.1),
            1 / 1.1
        ) * multiplier;

        let aimV3 = this.aimValue(map.combo, 1, 0, totalObj);
        let speedV3 = this.speedValue(map.combo, 1, 0, totalObj);
        let accV3 = this.accValue(1, 0, totalObj);

        let ss = Math.pow(
            Math.pow(aimV3, 1.1) +
            Math.pow(speedV3, 1.1) +
            Math.pow(accV3, 1.1),
            1 / 1.1
        ) * multiplier;

        this.value = {
            pp,
            fc,
            ss
        }
    }

    aimValue(combo: number, acc: number, miss: number, hits: number): number {
        let aimValue = this.map.diff.aim;

        if(this.mods.has("TouchDevice"))
            aimValue = Math.pow(aimValue, 0.8);

        aimValue = Math.pow(5 * Math.max(1, aimValue / 0.0675) - 4, 3) / 1e5;

        let totalObj = this.map.objects.circles + this.map.objects.sliders + this.map.objects.spinners;

        aimValue *= 0.95 + 0.4 * Math.min(1, totalObj / 2e3) +
            (totalObj > 2e3 ? Math.log10(totalObj / 2e3) * 0.5 : 0);

        // aimValue *= lengthBonus;
        
        aimValue *= Math.pow(0.97, miss);

        aimValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        let arFactor = 1;

        if(this.map.stats.ar > 10.33)
            arFactor += 0.3 * (this.map.stats.ar - 10.33);
        else if(this.map.stats.ar < 8)
            arFactor += 0.01 * (8 - this.map.stats.ar);

        aimValue *= arFactor;

        if(this.mods.has("Hidden"))
            aimValue *= 1.0 + 0.04 * (12 - this.map.stats.ar);

        if(this.mods.has("Flashlight"))
            aimValue *= 1.0 + 0.35 * Math.min(1, hits / 200) +
                (hits > 200
                    ? 0.3 * Math.min(1, (hits - 200) / 300) + 
                        (hits > 500 ? (hits - 500) / 1200 : 0)
                    : 0);

        aimValue *= 0.5 + acc / 2;

        aimValue *= 0.98 + Math.pow(this.map.stats.od, 2) / 2500;

        return aimValue;
    }
    
    speedValue(combo: number, acc: number, miss: number, hits: number): number {
        let speedValue = Math.pow(5 * Math.max(1, this.map.diff.speed / 0.0675) - 4, 3) / 1e5;
        
        let arFactor = 1;

        if(this.map.stats.ar > 10.33)
            arFactor += 0.3 * (this.map.stats.ar - 10.33);
        else if(this.map.stats.ar < 8)
            arFactor += 0.01 * (8 - this.map.stats.ar);

        if(this.map.stats.ar > 10.33)
            speedValue *= arFactor;

        speedValue *= 0.95 + 0.4 * Math.min(1, hits / 2e3) +
            (hits > 2e3 ? Math.log10(hits / 2e3) * 0.5 : 0);

        // speedValue *= lengthBonus;

        speedValue *= Math.pow(0.97, miss);

        speedValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        if(this.mods.has("Hidden"))
            speedValue *= 1 + 0.04 * (12 - this.map.stats.ar);

        speedValue *= 0.02 + acc;

        speedValue *= 0.96 + (Math.pow(this.map.stats.od, 2) / 1600);

        return speedValue;
    }

    accValue(acc: number, miss: number, obj: number): number {
        let hits = Util.getHitsFromAcc.osu(acc, miss, obj);
        let betterAccPerc = 0;
        if(this.map.objects.circles > 0)
            betterAccPerc = Math.min(((hits[300] - ((hits[300] + hits[100] + hits[50] + hits.miss) - this.map.objects.circles)) * 6 + hits[100] * 2 + hits[50]) / (this.map.objects.circles * 6), 1);

        let accValue = Math.pow(1.52163, this.map.stats.od) * Math.pow(betterAccPerc, 24) * 2.83;

        accValue *= Math.min(1.15, Math.pow(this.map.objects.circles / 1e3, 0.3));

        if(this.mods.has("Hidden"))
            accValue *= 1.08;
        if(this.mods.has("Flashlight"))
            accValue *= 1.02;

        return accValue;
    }
}

export default BanchoPP;