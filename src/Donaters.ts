import fs from "fs";
import Util from "./Util";

interface Donater {
    id: number,
    status: number
}

type ServerString = string | "bancho" | "gatari" | "ripple" | "akatsuki"

export default class Donaters {
    list: {
        bancho: Donater[],
        gatari: Donater[],
        ripple: Donater[],
        akatsuki: Donater[]
    };
    constructor() {
        if(!fs.existsSync("./donaters.json"))
            fs.writeFileSync("./donaters.json", JSON.stringify({bancho: [], gatari: [], ripple: [], akatsuki: []}, null, 4));

        this.list = JSON.parse(fs.readFileSync("./donaters.json").toString());

        setInterval(() => {
            this.save();
        }, 30000);
    }

    save() {
        fs.writeFileSync("./donaters.json", JSON.stringify(this.list, null, 4));
    }

    setDonater(server: ServerString, id: number, status: number = 1): boolean {
        if(!this.list[server])
            return false;
        if(this.list[server].some(a => a.id == id))
            this.list[server] = this.list[server].filter(d => d.id != id);
        this.list[server].push({
            id: id, status: status
        });
    }

    status(server: ServerString, id: number): string {
        if(!this.list[server])
            return '';
        let donater = this.list[server].find(d => d.id == id);
        return Util.donater(donater ? donater.status : 0);
    }
}