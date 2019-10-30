import { IBeatmapStats, HitCounts, ICommandArgs, IHits } from "./Types";
import { ICalcStats, OsuStats, TaikoStats, CatchStats, ManiaStats } from "./pp/Stats";
import { MessageContext } from "vk-io";
import Database from "./Database";

export default {
    hash: function (length: number = 10): String {
        let characters = "0123456789abcdef";
        let string = "";
        for(let i = 0; i < length; i++) {
            string += characters[Math.floor(Math.random() * characters.length)];
        }
        return string;
    },
    round: function(num: number, p: number): Number {
        return Math.round(num * (10 ** p)) / (10 ** p);
    },
    profileModes: ["STD", "Taiko", "Catch", "Mania"],
    getStats: function(stats: IBeatmapStats, mode: number): ICalcStats {
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
    },
    fixNumberLength(num: number): string {
        if(num > 9)
            return String(num);
        else
            return '0' + String(num);
    },
    formatBeatmapLength(length: number): string {
        length = Math.round(length);
        return `${this.fixNumberLength(Math.floor(length / 60))}:${this.fixNumberLength(length % 60)}`;
    },
    accuracy(counts: HitCounts): number {
        switch(counts.mode) {
            case 1:
                return (counts[300] * 2 + counts[100])/((counts[300] + counts[100] + counts[50] + counts.miss) * 2);
            case 2:
                return (counts[50] + counts[100] + counts[300])/(counts[50] + counts[100] + counts[300] + counts.miss + counts.katu);
            case 3:
                return ((counts[300] + counts.geki) * 6 + counts.katu * 4 + counts[100] * 2 + counts[50])/((counts[300] + counts[100] + counts.geki + counts.katu + counts[50] + counts.miss) * 6);
            default:
                return (counts[300] * 6 + counts[100] * 2 + counts[50])/((counts[300] + counts[100] + counts[50] + counts.miss) * 6);
        }
    },
    parseArgs(args: string[]): ICommandArgs {
        let iArg: ICommandArgs = {
            string: [],
            mods: "",
            combo: 0,
            miss: 0,
            acc: 0,
            place: 0
        };

        for(let i = args.length - 1; i > -1; i--) {
            let arg = args[i];
            console.log(arg);
            if(arg.startsWith("+")) {
                iArg.mods = arg.slice(1);
                args.splice(i, 1);
            } else if(arg.endsWith("x")) {
                iArg.combo = Number(arg.slice(0, -1));
                args.splice(i, 1);
            } else if(arg.endsWith("m")) {
                iArg.miss = Number(arg.slice(0, -1));
                args.splice(i, 1);
            } else if(arg.endsWith("%")) {
                iArg.acc = Number(arg.slice(0, -1));
                args.splice(i, 1);
            } else if(arg.startsWith("\\")) {
                console.log(arg.length);
                iArg.place = Number(arg.slice(1));
                args.splice(i, 1);
            }
        }

        iArg.string = args;

        return iArg;
    },
    getHitsFromAcc: {
        osu: function(acc: number, miss: number, obj: number): IHits {
            let hits = {
                300: -1,
                100: 0,
                50: 0,
                miss: miss
            };
            let n300 = hits[300];
            if(n300 < 0)
                n300 = Math.max(0, obj - hits[100] - hits[50] - hits.miss);
        
            let hitcount = n300 + hits[100] + hits[50] + hits.miss;
        
            if(hitcount > obj)
                n300 -= Math.min(n300, hitcount - obj);
        
            hitcount = n300 + hits[100] + hits[50] + hits.miss;
        
            if (hitcount > obj)
                hits[100] -= Math.min(hits[100], hitcount - obj);
        
            hitcount = n300 + hits[100] + hits[50] + hits.miss;
        
            if (hitcount > obj)
                hits[50] -= Math.min(hits[50], hitcount - obj);
        
            hitcount = n300 + hits[100] + hits[50] + hits.miss;
        
            hits[300] = obj - hits[100] - hits[50] - hits.miss;
        
            let max300 = obj - hits.miss;
        
            hits[100] = Math.round(
                -3 * ((acc * 0.01 - 1) * obj + hits.miss) * 0.5
            );
        
            if(hits[100] > max300) {
                hits[100] = 0;
                hits[50] = Math.round(
                    -6 * ((acc * 0.01 - 1) * obj + hits.miss) * 0.5
                );
                hits[50] = Math.min(max300, hits[50]);
            }
        
            hits[300] = obj - hits[100] - hits[50] - hits.miss;
        
            return hits;
        }
    },
    formatCombo(combo: number, full: number): string {
        if(!full)
            return `${combo}x`;
        return `${combo}x/${full}x`;
    },
    async sleep(ms: number) {
        return new Promise(r => setTimeout(r, ms));
    }
};