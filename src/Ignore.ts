import fs from "fs";

export default class IgnoreList {
    list: number[];
    constructor() {
        if(!fs.existsSync("./ignore_list.json"))
            fs.writeFileSync("./ignore_list.json", "[]");
        this.list = JSON.parse(fs.readFileSync("./ignore_list.json").toString());
    }

    switch(id: number): boolean {
        if(this.list.includes(id))
            this.list.splice(
                this.list.indexOf(id), 1
            )
        else
            this.list.push(id);

        return this.isIgnored(id);
    }

    isIgnored(id: number): boolean {
        return this.list.includes(id);
    }
}