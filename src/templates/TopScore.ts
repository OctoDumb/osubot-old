import { TopScore, APIBeatmap } from "../Types";
import Util from "../Util";

export default class TopScoreTemplate {
    score: TopScore;
    beatmap: APIBeatmap;
    place: Number;
    constructor(score: TopScore, beatmap: APIBeatmap, place: Number) {
        this.score = score;
        this.beatmap = beatmap;
        this.place = place;
    }

    use(): String {
        if(this.beatmap.mode != 0) return '';
        return `#${this.place}
${this.beatmap.title} [${this.beatmap.version}] ${this.score.mods.toString().length == 0 ? '' : '+' + this.score.mods}
AR:${Util.round(this.beatmap.stats.ar, 2)} CS:${Util.round(this.beatmap.stats.cs, 2)} OD:${Util.round(this.beatmap.stats.od, 2)} HP:${Util.round(this.beatmap.stats.hp, 2)} ${Util.round(this.beatmap.diff.stars, 2)}✩
Ранк: ${this.score.rank} ⯈ x${this.score.combo}/${this.beatmap.combo} ⯈ Длина: ${Util.formatBeatmapLength(this.beatmap.length)}
Точность: ${Util.round(this.score.accuracy() * 100, 2)}% ⯈ ${this.score.counts[300]}/${this.score.counts[100]}/${this.score.counts[50]}/${this.score.counts.miss}
PP: ${Util.round(this.score.pp, 2)}
https://osu.ppy.sh/b/${this.beatmap.id.map}`;
    }
}