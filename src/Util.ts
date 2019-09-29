import { IBeatmapStats } from "./Types";
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
    formatBeatmapLength(length: number): string {
        return `${Math.floor(length / 60)}:${length % 60}`;
    }
};