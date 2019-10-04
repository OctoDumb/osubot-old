import { isBuffer } from "util";
import leb from "leb";
import int64 from "int64-buffer";
import { HitCounts } from "./Types";

export default class Replay {
    raw_data: Buffer;
    offset: number;
    mode: number;
    version: number;
    beatmapHash: string;
    player: string;
    replayHash: string;
    counts: HitCounts;
    score: number;
    combo: number;
    perfect: number;
    mods: number;
    constructor(replay: string | Buffer) {
        this.raw_data = isBuffer(replay) ? replay : Buffer.from(replay);
        this.offset = 0x00;

        this.mode = this.byte();
        this.version = this.int();
        this.beatmapHash = this.string();
        this.player = this.string();
        this.replayHash = this.string();

        this.counts = new HitCounts({
            300: this.short(),
            100: this.short(),
            50: this.short(),
            geki: this.short(),
            katu: this.short(),
            miss: this.short()
        }, this.mode);

        this.score = this.int();
        this.combo = this.short();
        this.perfect = this.byte();

        this.mods = this.int();
    }

    byte() {
        this.offset += 1;
        return this.raw_data.readInt8(this.offset - 1);
    }

    short() {
        this.offset += 2;
        return this.raw_data.readUIntLE(this.offset - 2, 2);
    }

    int() {
        this.offset += 4;
        return this.raw_data.readInt32LE(this.offset - 4);
    }

    long() {
        this.offset += 8;
        return new int64.Uint64LE(this.raw_data.slice(this.offset - 8, this.offset)).toNumber();
    }

    string() {
        if(this.raw_data.readInt8(this.offset) == 0x0b) {
            this.offset += 1;
            let ulString = leb.decodeUInt64(this.raw_data.slice(this.offset, this.offset + 8));
            let strLength = ulString.value;
            this.offset += strLength + ulString.nextIndex;
            return this.raw_data.slice(this.offset - strLength, this.offset).toString();
        } else {
            this.offset += 1;
            return "";
        }
    }
}