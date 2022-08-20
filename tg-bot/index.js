require("dotenv").config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require("fs");
const { exec } = require("child_process");
const crypto = require("crypto");
const axios = require("axios").default;

var env = process.env;

env.TWEETS_FILTER___AND = env.TWEETS_FILTER___AND.toLowerCase();
env.TWEETS_FILTER___OR = env.TWEETS_FILTER___OR.toLowerCase();

!fs.existsSync("data.json") && fs.writeFileSync("data.json", JSON.stringify({ hashes: [] }, null, 4), { encoding: "utf8" });

var bot = new TelegramBot(env.TG_BOT_TOKEN, { polling: true, verbose: env.TG_BOT_VERBOSE });
bot.on("error", error => fs.appendFileSync("LOG-telegram-bot-errors.txt", error.message + "\n"));

const hash = input => crypto.createHash('sha256').update(input).digest('hex');
const sendMessageToChannel = message => env.TG_PASS_MESSAGE_SEND && bot.sendMessage(env.TG_CHANNEL, message);
(async () => {
    console.log("Initializing..");
    await new Promise(r => setTimeout(r, 5000));
    console.log("Initializing done!");
    while (true) {
        var jsonData = JSON.parse(fs.readFileSync("data.json", { encoding: "utf8" }));
        console.log("Requesting tweets from local server..");
        await axios.get(`${env.LOCAL_TWEETS_API_URL}/getTweets`, {
            data: {
                "user-id": env.TWITTER_TARGET_USER_ID
            }
        }).then(response => {
            var data = response.data;
            var tweets = data.tweets;
            console.log("Requesting tweets from local server done! Available tweets count: " + tweets.length);
            for (let index = 0; index < tweets.length; index++) {
                const tweet = tweets[index];
                const tweetText = { "plain": tweet.full_text, "plain-lowercase": tweet.full_text.toLowerCase(), "hash": hash(tweet.full_text) };
                if (jsonData.hashes.includes(tweetText.hash)) { console.log("JSONDATA CONTROL FAIL"); continue; }
                if (env.TWEETS_FILTER___OR.length > 0) {
                    var keys___OR = env.TWEETS_FILTER___OR.split(".");
                    var condition___OR = false;
                    for (const index2 in keys___OR) {
                        if (tweetText["plain-lowercase"].includes(keys___OR[index2].trim().toLowerCase())) condition___OR = true;
                    }
                    if (!condition___OR) { console.log("OR CONTROL FAIL"); continue; }
                }
                if (env.TWEETS_FILTER___AND.length > 0) {
                    var keys___AND = env.TWEETS_FILTER___AND.split(".");
                    var condition___AND = 0;
                    for (const index2 in keys___AND) {
                        condition___AND += (tweetText["plain-lowercase"].includes(keys___AND[index2].trim().toLowerCase())) ? 1 : 0;
                    }
                    if (condition___AND + 1 !== keys___AND.length) { console.log("AND CONTROL FAIL"); continue; }
                }
                jsonData.hashes.push(tweetText.hash);
                var plain = tweetText.plain;
                if (plain.includes("https://t.co/")) {
                    var replaced = plain.slice(0, plain.indexOf("https://t.co/"));
                    replaced += tweet.entities.urls[0].expanded_url;
                    replaced += plain.slice(plain.indexOf("https://t.co/") + "https://t.co/".length + 10);
                    plain = replaced;
                }
                console.log(tweetText, index);
                env.LOG_TWEET_TITLES && console.log(plain);
                sendMessageToChannel(plain);
            }
            fs.writeFileSync("data.json", JSON.stringify(jsonData, null, 4), { encoding: "utf8" });
        }).catch(error => fs.appendFileSync("LOG-local-tweet-api-errors.txt", (error.response ? JSON.stringify(error.response.data) : error.toString()) + "\n"));
        await new Promise(r => setTimeout(r, 20000));
    }
})();