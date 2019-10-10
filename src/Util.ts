import { IBeatmapStats, HitCounts, ICommandArgs } from "./Types";
import { ICalcStats, OsuStats, TaikoStats, CatchStats, ManiaStats } from "./pp/Stats";

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
            acc: 0
        };

        args.forEach((arg, i) => {
            if(arg.startsWith("+")) {
                iArg.mods = arg.slice(1);
                args.splice(i, 1);
                return;
            }

            if(arg.endsWith("x")) {
                iArg.combo = Number(arg.slice(0, -1));
                args.splice(i, 1);
                return;
            }

            if(arg.endsWith("m")) {
                iArg.miss = Number(arg.slice(0, -1));
                args.splice(i, 1);
                return;
            }

            if(arg.endsWith("%")) {
                iArg.acc = Number(arg.slice(0, -1));
                args.splice(i, 1);
            }
        });

        iArg.string = args;

        return iArg;
    }
};