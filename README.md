# Co-browsing with Twilio Data Sync
__Disclaimer__ - this is not an official example, provided AS-IS, use at your own risk.

__NB__ - actions on Sync objects used in this example are paid.

## Prerequisites
To start you will need following things:

 1. Twilio Account
 2. Twilio Account SID (starts with `AC` prefix) and [Auth Token](https://support.twilio.com/hc/en-us/articles/223136027-Auth-Tokens-and-How-to-Change-Them)
 3. [Twilio Signing Key and its Signing Key Secret](https://www.twilio.com/docs/iam/pkcv/account-and-key-management-api-keys)
 3. [Node.JS](https://nodejs.org/) installed

## Setup

You need to create a [service instance](https://www.twilio.com/docs/sync/api/service?code-sample=code-create-service-resource&code-language=curl&code-sdk-version=json) if you don't have one yet (replace `ACxxx` and `your_auth_token` correspondingly):
```
curl -X POST https://sync.twilio.com/v1/Services \
    -u ACxxx:auth_token
```
From response you'll get service instance SID which has `IS` prefix.

Create a `config.json` file in the root folder of this example with same structure as `example.config.json` and fill all the fields.

The `port` you're using can be any free port.

Run `npm install` once.

## Running

To start backend simply run:
```
npm start
```
To access it you can simply open a link it wrote in the console output, something like: http://localhost:8080.

Open as many tabs as you want. You can write in all of them and others will syncronise their state.

## Sharing via NGROK
To simplify sharing this example also provides [NGROK](https://ngrok.com/) url, which can be shared with everybody and allow access to your local backend as long as it is running. 

__NB__ - Your JWT tokens can be acquired by this URL!