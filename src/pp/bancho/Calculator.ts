import { IPPCalculator as ICalc } from '../Calculator';
import Mods from '../Mods';
import { APITopScore, APIRecentScore, APIBeatmap, HitCounts, APIScore, CalcArgs } from '../../Types';
import { ICalcStats } from '../Stats';
import Util from '../../Util';
import { Replay } from '../../Replay';

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
        this.map = map;
        this.mods = mods;
        this.stats = map.stats;
        if(mods.has("DoubleTime"))
            this.speedMultiplier *= 1.5;
        if(mods.has("HalfTime"))
            this.speedMultiplier *= 0.75;
    }

    calculate(score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs): IPP {
        if(this.mods.has("Relax") || this.mods.has("Relax2") || this.mods.has("Autoplay"))
            return {pp: 0, fc: 0, ss: 0};
        
        return this.PP(score).value;
    }

    PP(score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs) {
        switch(score.mode) {
            case 1:
                return new BanchoTaiko(this.map, score);
            case 2:
                return new BanchoCatch(this.map, score);
            case 3:
                return new BanchoMania(this.map, score);
            default:
                return new BanchoStd(this.map, score);
        }
    }
}

export class BanchoStd {
    map: APIBeatmap;
    mods: Mods;
    value: IPP;
    constructor(map: APIBeatmap, score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs) {
        this.map = map;
        this.mods = score.mods;

        let totalObj = this.map.objects.circles + this.map.objects.sliders + this.map.objects.spinners;

        let multiplier = 1.12;
        if(this.mods.has("NoFail"))
            multiplier *= Math.max(0,9, 1.0 - 0.02 * score.counts.miss);
        if(this.mods.has("SpunOut"))
            multiplier *= 1 - Math.pow(map.objects.spinners / score.counts.totalHits(), 0.85);

        let aimV1 = this.aimValue(score.combo, score.accuracy(), score.counts.miss, score.counts.totalHits());
        let speedV1 = this.speedValue(score.combo, score.accuracy(), score.counts.miss, score.counts.totalHits(), score.counts[50]);
        let accV1 = this.accValue(score.accuracy(), score.counts.miss, totalObj);

        let pp = Math.pow(
            Math.pow(aimV1, 1.1) +
            Math.pow(speedV1, 1.1) +
            Math.pow(accV1, 1.1),
            1 / 1.1
        ) * multiplier;

        let aimV2 = this.aimValue(map.combo, score.accuracy(), 0, totalObj);
        let speedV2 = this.speedValue(map.combo, score.accuracy(), 0, totalObj, score.counts[50]);
        let accV2 = this.accValue(score.accuracy(), 0, totalObj);

        let fc = Math.pow(
            Math.pow(aimV2, 1.1) +
            Math.pow(speedV2, 1.1) +
            Math.pow(accV2, 1.1),
            1 / 1.1
        ) * multiplier;

        let aimV3 = this.aimValue(map.combo, 1, 0, totalObj);
        let speedV3 = this.speedValue(map.combo, 1, 0, totalObj, score.counts[50]);
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
        
        if (miss > 0)
            aimValue *= 0.97 * Math.pow(1 - Math.pow(miss / hits, 0.775), miss);

        aimValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        let arFactor = 0;

        if(this.map.stats.ar > 10.33)
            arFactor += 0.4 * (this.map.stats.ar - 10.33);
        else if(this.map.stats.ar < 8)
            arFactor += 0.1 * (8 - this.map.stats.ar);

        aimValue *= 1 + Math.min(this.map.stats.ar, arFactor * (hits / 1000));

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
    
    speedValue(combo: number, acc: number, miss: number, hits: number, count50: number): number {
        let speedValue = Math.pow(5 * Math.max(1, this.map.diff.speed / 0.0675) - 4, 3) / 1e5;

        let lengthBonus = 0.95 + 0.4 * Math.min(1, hits / 2000) +
        (hits > 2000 ? Math.log10(hits / 2000) * 0.5 : 0);

        speedValue *= lengthBonus;

        if (miss > 0)
            speedValue *= 0.97 * Math.pow(1 - Math.pow(miss / hits, 0.775), Math.pow(miss, 0.875));

        if (this.map.combo > 0)
            speedValue *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        let arFactor = 0;
        if (this.map.stats.ar > 10.33)
            arFactor += 0.4 * (this.map.stats.ar - 10.33);
            
        speedValue *= 1 + Math.min(arFactor, arFactor * (hits / 1000));

        /* if (this.mods.has("Hidden"))
            speedValue *= 1 + 0.04 * (12 - this.map.stats.ar); */

        speedValue *= (0.95 + Math.pow(this.map.stats.od, 2) / 750) * Math.pow(acc, (14.5 - Math.max(this.map.stats.od, 8)) / 2)

        speedValue *= Math.pow(0.98, count50 < hits / 500 ? 0 : count50 - hits / 500);

        return speedValue;
    }

    accValue(acc: number, miss: number, obj: number): number {
        let hits = Util.getHitsFromAcc.osu(acc * 100, miss, obj);
        let totalHits = hits[300] + hits[100] + hits[50] + hits.miss;
        let betterAccPerc = 0;
        if(this.map.objects.circles > 0)
            betterAccPerc = Math.min(((hits[300] - (totalHits - this.map.objects.circles)) * 6 + hits[100] * 2 + hits[50]) / (this.map.objects.circles * 6), 1);

        let accValue = Math.pow(1.52163, this.map.stats.od) * Math.pow(betterAccPerc, 24) * 2.83;

        accValue *= Math.min(1.15, Math.pow(this.map.objects.circles / 1e3, 0.3));

        if(this.mods.has("Hidden"))
            accValue *= 1.08;
        if(this.mods.has("Flashlight"))
            accValue *= 1.02;

        return accValue;
    }
}

class BanchoTaiko {
    map: APIBeatmap;
    mods: Mods;
    value: IPP;
    constructor(map: APIBeatmap, score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs) {
        this.map = map;
        this.mods = score.mods;

        let multiplier = 1.1;
        if(this.mods.has("NoFail"))
            multiplier *= 0.9;

        if(this.mods.has("Hidden"))
            multiplier *= 1.1;

        let totalHits = score.counts.totalHits()

        let str1 = this.strainValue(totalHits, score.accuracy(), score.counts.miss);
        let acc1 = this.accValue(score.accuracy(), totalHits);

        let pp = Math.pow(
            Math.pow(str1, 1.1) +
            Math.pow(acc1, 1.1),
            1.0 / 1.1
        ) * multiplier;

        let str2 = this.strainValue(map.combo, score.accuracy(), 0);
        let acc2 = this.accValue(score.accuracy(), map.combo);

        let fc = Math.pow(
            Math.pow(str2, 1.1) +
            Math.pow(acc2, 1.1),
            1.0 / 1.1
        ) * multiplier;

        let str3 = this.strainValue(map.combo, 1, 0);
        let acc3 = this.accValue(1, map.combo);

        let ss = Math.pow(
            Math.pow(str3, 1.1) +
            Math.pow(acc3, 1.1),
            1.0 / 1.1
        ) * multiplier;

        this.value = {
            pp,
            fc,
            ss
        };
    }

    strainValue(hits: number, acc: number, miss: number): number {
        let strainValue = Math.pow(5 * Math.max(1, this.map.diff.stars / 0.0075) - 4, 2) / 1e5;

        let lengthBonus = 1 + 0.1 * Math.min(1, hits / 1500);
        strainValue *= lengthBonus;

        strainValue *= Math.pow(0.985, miss);

        strainValue *= Math.min(Math.pow((hits - miss), 0.5) / Math.pow(this.map.combo, 0.5), 1);

        if(this.mods.has("Hidden"))
            strainValue *= 1.025;

        if(this.mods.has("Flashlight"))
            strainValue *= 1.05 * lengthBonus;

        strainValue *= acc;
        
        return strainValue;
    }

    accValue(acc: number, hits: number): number {
        let accValue = Math.pow(150 / this.map.stats.hitWindow(), 1.1) * Math.pow(acc, 15) * 22;

        accValue *= Math.min(1.15, Math.pow(hits / 1500, 0.3));

        return accValue;
    }
}

class BanchoCatch {
    map: APIBeatmap;
    mods: Mods;
    value: IPP;
    constructor(map: APIBeatmap, score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs) {
        this.map = map;
        this.mods = score.mods;

        this.value = {
            pp: this.totalValue(map.diff.stars, score.accuracy(), score.combo, score.counts.miss),
            fc: this.totalValue(map.diff.stars, score.accuracy(), map.combo, 0),
            ss: this.totalValue(map.diff.stars, 1, map.combo, 0)
        }
    }

    totalValue(stars: number, acc: number, combo: number, miss: number) {
        let pp = Math.pow(((5 * stars / 0.0049) - 4), 2) / 1e5;
        let lengthBonus = 0.95 + 0.3 * Math.min(1, combo / 2500);
        if(combo > 2500)
            lengthBonus += Math.log10(combo / 2500) * 0.475;

        pp *= lengthBonus;
        pp *= Math.pow(0.97, miss);
        pp *= Math.min(Math.pow(combo, 0.8) / Math.pow(this.map.combo, 0.8), 1);

        let arFactor = 1;
        if(this.map.stats.ar > 9)
            arFactor += 0.1 * (this.map.stats.ar - 9);
        if(this.map.stats.ar > 10)
            arFactor += 0.1 * (this.map.stats.ar - 10);
        else if(this.map.stats.ar < 8)
            arFactor += 0.025 * (8 - this.map.stats.ar);

        pp *= arFactor;

        if(this.mods.has("Hidden")) {
            pp *= 1.05 + 0.075 * (10 - Math.min(10, this.map.stats.ar));
            if(this.map.stats.ar <= 10)
                pp *= 1.05 + 0.075 * (10 - this.map.stats.ar);
            else if(this.map.stats.ar > 10)
                pp *= 1.01 + 0.04 * (11 - Math.min(this.map.stats.ar, 11));
        }

        if(this.mods.has("Flashlight"))
            pp *= 1.35 * lengthBonus;

        pp *= Math.pow(acc, 5.5);

        if(this.mods.has("NoFail"))
            pp *= 0.9;

        return pp;
    }
}

class BanchoMania {
    map: APIBeatmap;
    mods: Mods;
    value: IPP;
    constructor(map: APIBeatmap, score: APITopScore | APIRecentScore | APIScore | Replay | CalcArgs) {
        this.map = map;
        this.mods = score.mods;

        let score_mul = 1;
        if(this.mods.has("Easy"))
            score_mul *= 0.5;
        if(this.mods.has("NoFail"))
            score_mul *= 0.5;
        if(this.mods.has("HalfTime"))
            score_mul *= 0.5;

        let multiplier = 0.8;
        if(this.mods.has("NoFail"))
            multiplier *= 0.9;
        if(this.mods.has("Easy"))
            multiplier *= 0.5;

        let str1 = this.strainValue(score_mul, map.diff.stars, score.score, score.counts.totalHits());
        let acc1 = this.accValue(map.stats.hitWindow(), str1, score.score, score_mul);

        let pp = Math.pow(
            Math.pow(str1, 1.1) +
            Math.pow(acc1, 1.1),
            1.0 / 1.1
        ) * multiplier;

        let str2 = this.strainValue(score_mul, map.diff.stars, 1e6, score.counts.totalHits());
        let acc2 = this.accValue(map.stats.hitWindow(), str1, 1e6, score_mul);

        let ss = Math.pow(
            Math.pow(str2, 1.1) +
            Math.pow(acc2, 1.1),
            1.0 / 1.1
        ) * multiplier;

        this.value = {
            pp,
            fc: pp,
            ss
        }
    }

    strainValue(mul: number, strain: number, score: number, hits: number) {
        score /= mul;
        let strainValue = Math.pow(5 * Math.max(1, strain / 0.2) - 4, 2.2) / 135;
        strainValue *= 1 + 0.1 * Math.min(1, hits / 1500);

        if(score <= 5e5)
            strainValue = 0;
        else if(score <= 6e5)
            strainValue *= (score - 5e5) / 1e5 * 0.3;
        else if(score <= 7e5)
            strainValue *= 0.3 + (score - 6e5) / 1e5 * 0.25;
        else if(score <= 8e5)
            strainValue *= 0.55 + (score - 7e5) / 1e5 * 0.2;
        else if(score <= 9e5)
            strainValue *= 0.75 + (score - 8e5) / 1e5 * 0.15;
        else
            strainValue *= 0.9 + (score - 9e5) / 1e5 * 0.1;

        return strainValue;
    }

    accValue(hitWindow: number, strainValue: number, score: number, mul: number) {
        score /= mul;
        return Math.max(0, 0.2 - ((hitWindow - 34) * 0.006667)) * strainValue * Math.pow((Math.max(0, (score - 960000)) / 4e4), 1.1);
    }
}

export default BanchoPP;