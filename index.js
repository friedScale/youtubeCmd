'use strict';

const com = require("commander"),
      req = require("request-promise"),
      columnify = require('columnify');

const { prompt } = require("inquirer");
const { spawn } = require( 'child_process' );

class Store {
    constructor() {
        this.apiKey = "my_youtube_api_key";
    }

    search({ type, keyword, page }) {
        if (keyword === undefined) return Promise.reject("no search keyword");

        let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=${type}&q=${encodeURIComponent(keyword)}&maxResults=${12}&key=${this.apiKey}`;

        if (page) {
            url += `&pageToken=${page}`
        }
        
        return new Promise(function(resolve, reject) {
            req({uri: url, json: true,}).then(resolve);
        });
    }
}

class Command { 
    constructor(prop) {
        this.store = new Store();
    }

    execute() {} 
};

const resultFormatter = function(result) {
    return result.items.map((data, i) => {
        let line = data.snippet;
        return { i: `[${i}]`, title: line.title, description: line.description, channelTitle: line.channelTitle };
    });
}

const resultDisplayer = function(result) {
    let data = resultFormatter(result),
        lines = columnify(data, {
            config: {
                name: {
                    headingTransform: name => name.toUpperCase()
                },
                i: {
                    maxWidth: 5
                },
                title: {
                    minWidth: 10,
                    maxWidth: 60
                },
                description: {
                    minWidth: 10,
                    maxWidth: 100
                }
            }
        });
    console.log(lines);
}

const commFactory = {
    searchCommand: class extends Command {
        execute(args) {
            return this.store.search({...args}).then(result => {
                resultDisplayer(result);

                return prompt({ 
                    type: "input", 
                    name: "answer",
                    message: "enter [p] if you want back to previous page, [n] for see next page, any number for play video from the list" 
                }).then(({answer}) => {
                    if (!["p", "n"].includes(answer) && isNaN(Number(answer))) throw Error("vague answer, closing the app");

                    switch(answer) {
                        case "p": return this.execute({...args, page: result.prevPageToken});
                        case "n": return this.execute({...args, page: result.nextPageToken});
                        default: return Promise.resolve(result.items[answer]);
                    }
                });                    
            });
        }
    },
    
    playCommand: class extends Command {
        execute() {
            return Promise.resolve();            
        }    
    }
}

class Invoker {
    static getCommand(cmd) {
        let klass = commFactory[cmd + "Command"];
        if (klass) {
            this.command = new klass();
        }
        return this.command;
    }

    static execute() {
        this.command.execute();
        return this.command;
    }
}


com
    .version("0.0.1")
    .command("search [keyword]")
    .option('-t, --type <type>', 'the type you want to find [video, playlist, channel]')
    .option('-i, --interface', 'the type you want to find [video, playlist, channel]')
    .action(function(keyword, cmd) {
        const type = cmd.type || "video";
        Invoker.getCommand("search").execute({ keyword, type: type })
               .then(result => {
                    switch(type) {
                        case "video":
                            const vlc = spawn(cmd.interface? "vlc" : "cvlc", [`https://www.youtube.com/watch?v=${result.id.videoId}`], { detached: true });
                            vlc.on("close", () => {
                                spawn("killall", ["vlc"]);
                            });
                            break;
                        case "playlist":
                            spawn("firefox", [`https://www.youtube.com/playlist?list=${result.id.playlistId}`], { detached: true });
                            break;
                        case "channel":
                            spawn("firefox", [`https://www.youtube.com/channel/${result.id.channelId}`], { detached: true })
                            break;
                    }
                });
    });


com
    .command("play [videoId]")
    .action(function(videoId, cmd) {
        spawn('vlc', [`https://www.youtube.com/watch?v=${videoId}`], { detached: true });
    });


com
    .parse(process.argv);