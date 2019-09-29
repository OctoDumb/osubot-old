import { IBeatmapStats } from '../Types';
import Mods from './Mods';

interface ICalcStats {
    ar: number,
    cs: number,
    od: number,
    hp: number,
    modify(mods: Mods): void
}

class OsuStats implements ICalcStats {
    ar: number;
    cs: number;
    od: number;
    hp: number;
    constructor(base: IBeatmapStats) {
        this.ar = base.ar;
        this.cs = base.cs;
        this.od = base.od;
        this.hp = base.hp;
    }

    modify(mods: Mods) {
        let speedMul = 1;
        if(mods.has("DoubleTime"))
            speedMul *= 1.5;
        if(mods.has("HalfTime"))
            speedMul *= 0.75;
        
        let multiplier = 1;
        if(mods.has("Easy"))
            multiplier *= 0.5;
        if(mods.has("HardRock"))
            multiplier *= 1.4;
        
        // Modify AR
        let baseAR = this.ar;
        baseAR *= multiplier;
        let arms = (
            baseAR < 5 ?
            1800 - 120 * baseAR
            : 1200 - 150 * (baseAR - 5)
        );
        arms = Math.min(1800, Math.max(450, arms));
        arms /= speedMul;
        this.ar = (
            arms > 1200 ?
            (1800 - arms) / 120
            : 5 + (1200 - arms) / 150
        );

        // Modify OD
        let baseOD = this.od;
        baseOD *= multiplier;
        let odms = 80 - Math.ceil(6 * baseOD);
        odms = Math.min(80, Math.max(20, odms));
        odms /= speedMul;
        this.od = (80 - odms) / 6;

        // Modify CS
        if(mods.has("HardRock"))
            this.cs *= 1.3;
        if(mods.has("Easy"))
            this.cs *= 0.5;
        this.cs = Math.min(this.cs, 10);

        // Modify HP
        this.hp = Math.min(this.hp * multiplier, 10);
    }
}

class TaikoStats implements ICalcStats {
    ar: number;
    cs: number;
    od: number;
    hp: number;
    constructor(base: IBeatmapStats) {
        this.ar = base.ar;
        this.cs = base.cs;
        this.od = base.od;
        this.hp = base.hp;
    }

    modify(mods: Mods) {
        if(mods.has("Easy"))
            this.od *= 0.5;
        if(mods.has("HardRock"))
            this.od *= 1.4;
        this.od = Math.max(0, Math.min(10, this.od));
    }
}

class CatchStats implements ICalcStats {
    ar: number;
    cs: number;
    od: number;
    hp: number;
    constructor(base: IBeatmapStats) {
        this.ar = base.ar;
        this.cs = base.cs;
        this.od = base.od;
        this.hp = base.hp;
    }

    modify(mods: Mods) {
        //
    }
}

class ManiaStats implements ICalcStats {
    ar: number;
    cs: number;
    od: number;
    hp: number;
    constructor(base: IBeatmapStats) {
        this.ar = base.ar;
        this.cs = base.cs;
        this.od = base.od;
        this.hp = base.hp;
    }

    modify(mods: Mods) {
        //
    }
}

export {
    ICalcStats,
    OsuStats,
    TaikoStats,
    CatchStats,
    ManiaStats
};