import { APIRecentScore, APIBeatmap } from '../Types';
import Util from '../Util';

export default class RecentScoreTemplate {
    score: APIRecentScore;
    beatmap: APIBeatmap;
    constructor(score: APIRecentScore, beatmap: APIBeatmap) {
        this.score = score;
        this.beatmap = beatmap;
    }

    use(): string {
        if(this.beatmap.mode != 0) return '';
        return `${this.beatmap.artist} - ${this.beatmap.title} [${this.beatmap.version}] by ${this.beatmap.creator.nickname}
${Util.formatBeatmapLength(this.beatmap.length)} | AR:${Util.round(this.beatmap.stats.ar, 2)} CS:${Util.round(this.beatmap.stats.cs, 2)} OD:${Util.round(this.beatmap.stats.od, 2)} HP:${Util.round(this.beatmap.stats.hp, 2)} ${Math.round(this.beatmap.bpm)}BPM | ${Util.round(this.beatmap.diff.stars, 2)}✩ ${this.score.mods.toString().length ? '+'+this.score.mods.toString() : ''}

Очки: ${this.score.score} | Комбо: ${this.score.combo}x / ${this.beatmap.combo}x
Точность: ${Util.round(this.score.accuracy() * 100, 2)}%
PP: ---
Хиткаунты: ${this.score.counts.toString()}
Ранк: ${this.score.rank}

Карта: https://osu.ppy.sh/b/${this.beatmap.id.map}`;
    }
}