require('dotenv').config();
var axios = require('axios').default;
var express = require('express');
var bodyParser = require('body-parser');
var ws = require('ws');
var app = express();

app.use(express.bodyParser());
// create application/json parser
// var jsonParser = bodyParser.json();

// // create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

var env = process.env;

var wss = new ws.WebSocketServer({ host: env.WS_HOST, port: env.WS_PORT });

var getTweets = async (userId, limit) => axios.get(`https://twitter.com/i/api/graphql/13YiYsEb_QTeI-2Wy-wv3A/UserTweets?variables=%7B%22userId%22%3A%22${userId}%22%2C%22count%22%3A40%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22dont_mention_me_view_api_enabled%22%3Atrue%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_uc_gql_enabled%22%3Afalse%2C%22vibe_api_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Afalse%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`, {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    "content-type": "application/json",
    "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Microsoft Edge\";v=\"103\", \"Chromium\";v=\"103\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-csrf-token": "7165fd6558b3e7a7352b2628ebe1c2a41506fbe8bfcce0b41bbb799ef982e62af26081868dcbb6b9f98fd790410e8951b578db90d07227b247b7d5bdfe0155f4f196c5fb272815713ff5c24bd7574aac",
    "x-twitter-active-user": "yes",
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-client-language": "tr",
    "cookie": "guest_id=v1%3A164969443860766520; kdt=r3u4pwQChHD9KF2SDEKOJiUpOB6KEsQVdssKAfP8; lang=tr; d_prefs=MToxLGNvbnNlbnRfdmVyc2lvbjoyLHRleHRfdmVyc2lvbjoxMDAw; guest_id_ads=v1%3A164969443860766520; guest_id_marketing=v1%3A164969443860766520; personalization_id=\"v1_qybJWZLOs0Tm91tgv4LbAQ==\"; at_check=true; eu_cn=1; auth_token=b1b7cef75f82017457a7ea90eab240affab2655b; ct0=7165fd6558b3e7a7352b2628ebe1c2a41506fbe8bfcce0b41bbb799ef982e62af26081868dcbb6b9f98fd790410e8951b578db90d07227b247b7d5bdfe0155f4f196c5fb272815713ff5c24bd7574aac; twid=u%3D908444766014251008; _gid=GA1.2.179950127.1658606442; mbox=PC#9b3ccc9ddaec43edbe5c0859e0d9f374.37_0#1722014203|session#7a2fd4a398ba4e8badf7ff11572e890c#1658771263; external_referer=padhuUp37zixoA2Yz6IlsoQTSjz5FgRcKMoWWYN3PEQ%3D|0|8e8t2xd8A2w%3D; _ga_34PHSZMC42=GS1.1.1658769316.6.1.1658769414.0; _ga=GA1.2.2072660744.1649755130; _twitter_sess=BAh7CyIKZmxhc2hJQzonQWN0aW9uQ29udHJvbGxlcjo6Rmxhc2g6OkZsYXNo%250ASGFzaHsABjoKQHVzZWR7ADoPY3JlYXRlZF9hdGwrCH1%252BcxmAAToMY3NyZl9p%250AZCIlMTAxMzFkNzMxYzNjYzgyMjMzYTMwZDBhY2YxMzVkNWI6B2lkIiVjYmMx%250AMDBmNzhkYzM3MDI4ODBjYzg3Yjg2ZDMwNjhiMzofbGFzdF9wYXNzd29yZF9j%250Ab25maXJtYXRpb24iFTE2NTg3Njk0MzM5MTgwMDA6HnBhc3N3b3JkX2NvbmZp%250Acm1hdGlvbl91aWQiFzkwODQ0NDc2NjAxNDI1MTAwOA%253D%253D--9c162a8fe6249b8cc3a8b47eb62c950230634169; des_opt_in=Y",
    "Referer": "https://twitter.com/madnews_io",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  }
});

app.get('/getTweets', function (req, res) {
  var body = req.body;
  if (!body["user-id"]) body = req.params;
  var userId = body['user-id'];
  if (!userId) {
    res.send({
      success: false,
      description: "Please set \"user-id\" in request body"
    });
    return;
  }

  getTweets(userId, 9999).then(data => {
    var data = data.data.data;
    var userDataCD0 = data.user.result.timeline_v2.timeline.instructions[1].entries[0].content.itemContent.tweet_results.result.core.user_results.result;
    var userDataCD1 = userDataCD0.legacy;

    var send = {"user": {
    "id": userDataCD0.rest_id,
    "has_nft_avatar": userDataCD1.has_nft_avatar,
    "blocked_by": userDataCD1.blocked_by,
    "blocking": userDataCD1.blocking,
    "can_dm": userDataCD1.can_dm,
    "can_media_tag": userDataCD1.can_media_tag,
    "created_at": userDataCD1.created_at,
    "default_profile": userDataCD1.default_profile,
    "default_profile_image": userDataCD1.default_profile_image,
    "description": userDataCD1.descriptionw,
    "entities": userDataCD1.entities,
    "favourites_count": userDataCD1.favourites_count,
    "follow_request_sent": userDataCD1.follow_request_sent,
    "followed_by": userDataCD1.followed_by,
    "followers_count": userDataCD1.followers_count,
    "friends_count": userDataCD1.friends_count,
    "has_custom_timelines": userDataCD1.has_custom_timelines,
    "is_translator": userDataCD1.is_translator,
    "listed_count": userDataCD1.listed_count,
    "location": userDataCD1.location,
    "media_count": userDataCD1.media_count,
    "name": userDataCD1.name,
    "normal_followers_count": userDataCD1.normal_followers_count,
    "pinned_tweet_ids_str": userDataCD1.pinned_tweet_ids_str,
    "possibly_sensitive": userDataCD1.possibly_sensitive,
    "profile_banner_url": userDataCD1.profile_banner_url,
    "profile_image_url_https": userDataCD1.profile_image_url_https,
    "profile_interstitial_type": userDataCD1.profile_interstitial_type,
    "protected": userDataCD1.protected,
    "screen_name": userDataCD1.screen_name,
    "statuses_count": userDataCD1.statuses_count,
    "translator_type": userDataCD1.translator_type,
    "url": userDataCD1.url,
    "verified": userDataCD1.verified,
    "want_retweets": userDataCD1.want_retweets,
    "withheld_in_countries": userDataCD1.withheld_in_countries,
    "super_follow_eligible": userDataCD1.super_follow_eligible,
    "super_followed_by": userDataCD1.super_followed_by,
    "super_following": userDataCD1.super_following
    }, "tweets": []};
    var array = data.user.result.timeline_v2.timeline.instructions[1].entries;
    for (let index = 0; index < array.length; index++) {
      // if (array[index].content.itemContent.tweet_results)
      console.log(array[index].content.itemContent);
      if (array[index].content.itemContent) {
        var itemCD0 = array[index].content.itemContent.tweet_results.result;
        var itemCD1 = itemCD0.legacy;
        var tweet = {
          "id": itemCD0.rest_id,
          "created_at": itemCD1.created_at,
          "conversation_id_str": itemCD1.conversation_id_str,
          "entities": itemCD1.entities,
          "extended_entities": itemCD1.extended_entities,
          "favorite_count": itemCD1.favorite_count,
          "full_text": itemCD1.full_text,
          "is_quote_status": itemCD1.is_quote_status,
          "lang": itemCD1.lang,
          "possibly_sensitive": itemCD1.possibly_sensitive,
          "possibly_sensitive_editable": itemCD1.possibly_sensitive_editable,
          "quote_count": itemCD1.quote_count,
          "reply_count": itemCD1.reply_count,
          "retweet_count": itemCD1.retweet_count,
          "user_id_str": itemCD1.user_id_str,
        };
        tweet.entities.urls.indices = null;
        tweet.entities.hashtags.indices = null;
        var keys = ["urls", "hashtags", "symbols", "user_mentions"];
        for (let index = 0; index < keys.length; index++) {
          var key = keys[index];
          for (let index2 = 0; index2 < keys.length; index2++) {
            if(tweet.entities[key][index2]) delete tweet.entities[key][index2].indices;
          }
        }
        send.tweets.push(tweet);
      }
    }
    var keys = ["urls"];
    for (let index = 0; index < keys.length; index++) {
      var key = keys[index];
      for (let index2 = 0; index2 < keys.length; index2++) {
        if(send.user.entities.url[key][index2]) delete send.user.entities.url[key][index2].indices;
      }
    }
    res.send(send);
  }).catch(err => res.send(err.toString()))
  // (getTweets(userId, 9999).then(data => [res.status(200), res.send({ "status": data.status, "statusText": data.statusText, "data": data.data })])).catch(reason => [res.status(400), res.send({ "message": reason.message, "code": reason.code, "status": reason.status })]);
})
wss.on('listening', () => console.log(`WS server is running at port: ${env.WS_PORT}`));
app.listen(env.HTTP_PORT, () => console.log(`HTTP server is running at port: ${env.HTTP_PORT}`));
