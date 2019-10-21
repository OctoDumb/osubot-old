import User from './User';
import TopScore from './TopScore';
import RecentScore from './Recent';
import Compare from './Compare';
import ReplayT from './Replay';
import { Replay } from '../Replay';
import { APIUser, APITopScore, APIBeatmap, APIRecentScore, APIScore } from '../Types';
import { Module } from '../Module';

interface ITemplates {
    User: (user: APIUser, module: Module, mode: number) => string;
    TopScore: (score: APITopScore, beatmap: APIBeatmap, place: number) => string;
    RecentScore: (score: APIRecentScore, beatmap: APIBeatmap) => string;
    Compare: (score: APIScore, beatmap: APIBeatmap) => string;
    Replay: (replay: Replay, map: APIBeatmap) => string;
}

var Templates: ITemplates = {
    User,
    TopScore,
    RecentScore,
    Compare,
    Replay: ReplayT
}

export {
    ITemplates,
    Templates
}