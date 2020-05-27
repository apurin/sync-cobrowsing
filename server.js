// Generating clinet side JWT tokens
const Twilio = require('twilio');
const AccessToken = Twilio.jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;

const config = require('./config.json');

const getToken = identity => {
    const syncGrant = new SyncGrant({
        serviceSid: config.serviceSid
    });
    
    const jwtToken = new AccessToken(config.accountSid, config.signingKey, config.signingKeySecret);
    jwtToken.addGrant(syncGrant);
    jwtToken.identity = identity;
    return jwtToken.toJwt();
}

// Creating service
const express = require('express');
const app = express();
app.use(express.json());

app.use(express.static('static'));

app.get('/token/:identity', (req, res) => {
    const identity = req.params.identity;

    console.log(`Returning token for ${identity}`);
    res.send({
        identity: identity,
        token: getToken(identity)
    });
});

app.listen(config.port);

console.log(`Open http://localhost:${config.port}/`);

// Creating NGROK endpoint
const ngrok = require('ngrok');

ngrok.connect(config.port)
    .then(ngrokUrl => console.log(`Or ${ngrokUrl}`));
