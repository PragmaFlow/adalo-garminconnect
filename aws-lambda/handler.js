"use strict";
var request = require("request-compose").extend({
  Request: { oauth: require("request-oauth") },
}).client;
const fetch = require("node-fetch");

const CONSUMER_KEY = "[your garmin key]";
const CONSUMER_SECRET = "[your garmin secret]";

const APP_ID = "[your adalo app id]";
const APP_SECRET = "[your adalo app secret]";
const USERS_COLLECTION_ID = "[your oauth table]";

module.exports.getAccessToken = async (event, context, callback) => {
  try {
    console.log(event);
    console.log(
      `oauth: ${JSON.stringify({
        oauth: {
          consumer_key: CONSUMER_KEY,
          consumer_secret: CONSUMER_SECRET,
          token: event.queryStringParameters.token,
          token_secret: event.queryStringParameters.token_secret,
          verifier: event.queryStringParameters.verifier,
        },
      })}`
    );
    const ret = await request({
      url: "https://connectapi.garmin.com/oauth-service/oauth/access_token",
      oauth: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        token: event.queryStringParameters.token,
        token_secret: event.queryStringParameters.token_secret,
        verifier: event.queryStringParameters.verifier,
      },
    });
    const [oauth_token_pair, oauth_token_secret_pair] = ret.body.split("&");
    const [, oauth_token] = oauth_token_pair.split("=");
    const [, oauth_token_secret] = oauth_token_secret_pair.split("=");
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        oauth_token,
        oauth_token_secret,
      }),
    });
  } catch (e) {
    callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(e.message),
    });
  }
};

module.exports.garminCallback = async (event, context, callback) => {
  const response = await fetch(
    `https://api.adalo.com/v0/apps/${APP_ID}/collections/${USERS_COLLECTION_ID}`,
    {
      headers: {
        Authorization: `Bearer ${APP_SECRET}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    }
  );
  console.log("here");
  const json = await response.json();
  console.log(JSON.stringify(json));

  const user_record = json.records.find(
    (record) =>
      record["Request Token"] === event.queryStringParameters.oauth_token
  );
  if (user_record) {
    console.log(user_record);
    const put_response = await fetch(
      `https://api.adalo.com/v0/apps/${APP_ID}/collections/${USERS_COLLECTION_ID}/${user_record.id}`,
      {
        headers: {
          Authorization: `Bearer ${APP_SECRET}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          Verifyer: event.queryStringParameters.oauth_verifier,
        }),
      }
    );

    callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: "",
    });
  }

  callback(null, {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: `could not find user with token ${event.queryStringParameters.oauth_token}`,
  });
};

module.exports.getRequestToken = async (event, context, callback) => {
  try {
    const ret = await request({
      url: "https://connectapi.garmin.com/oauth-service/oauth/request_token",
      oauth: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
      },
    });
    console.log(ret);
    const [oauth_token_pair, oauth_token_secret_pair] = ret.body.split("&");
    const [, oauth_token] = oauth_token_pair.split("=");
    const [, oauth_token_secret] = oauth_token_secret_pair.split("=");
    callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        oauth_token,
        oauth_token_secret,
      }),
    });
  } catch (e) {
    callback(null, {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(e),
    });
  }
};
