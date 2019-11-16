import User from './User';
import TopScore from './TopScore';
import TopSingle from './TopSingle';
import RecentScore from './Recent';
import Compare from './Compare';
import ReplayT from './Replay';
import Beatmap from "./Beatmap";
import PP from "./PP";
import Leaderboard from "./Leaderboard";
import { Replay } from '../Replay';
import { APIUser, APITopScore, APIBeatmap, APIRecentScore, APIScore, ICommandArgs, LeaderboardResponse } from '../Types';
import { IPPCalculator as ICalc } from '../pp/Calculator';

interface ITemplates {
    User: (user: APIUser, mode: number, status: string, link: string) => string;
    TopScore: (score: APITopScore, beatmap: APIBeatmap, place: number, calc: ICalc, link: string) => string;
    TopSingle: (score: APITopScore, beatmap: APIBeatmap, user: APIUser, place: number, calc: ICalc, link: string) => string;
    RecentScore: (score: APIRecentScore, beatmap: APIBeatmap, calc: ICalc, link: string) => string;
    Compare: (score: APIScore, beatmap: APIBeatmap, calc: ICalc) => string;
    Replay: (replay: Replay, map: APIBeatmap, calc: ICalc) => string;
    Beatmap: (map: APIBeatmap) => string;
    PP: (map: APIBeatmap, args: ICommandArgs) => string;
    Leaderboard: (leaderboard: LeaderboardResponse, server: string) => string;
}

var Templates: ITemplates = {
    User,
    TopScore,
    TopSingle,
    RecentScore,
    Compare,
    Replay: ReplayT,
    Beatmap,
    PP,
    Leaderboard
}

export {
    ITemplates,
    Templates
}