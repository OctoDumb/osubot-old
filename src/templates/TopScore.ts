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
${this.beatmap.title} [${this.beatmap.version}] +${this.score.mods}
AR:${this.beatmap.stats.ar} CS:${this.beatmap.stats.cs} OD:${this.beatmap.stats.od} HP:${this.beatmap.stats.hp} ${Util.round(this.beatmap.diff.stars, 2)}✩
Ранк: ${this.score.rank}⯈x${this.score.combo}/${this.beatmap.combo}⯈Длина: ${this.beatmap.length}
${this.score.counts[300]}/${this.score.counts[100]}/${this.score.counts[50]}/${this.score.counts.miss}
PP: ${Util.round(this.score.pp, 2)}
https://osu.ppy.sh/b/${this.beatmap.id.map}`;
    }
}