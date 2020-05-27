$(document).ready(async () => {
    // Getting user name from query param
    var urlParams = new URLSearchParams(window.location.search);
    document.identity = urlParams.get('name');
    
    // Getting JWT token from local Express server
    const getJwtToken = async () => new Promise((resolve, reject) => {
        $('#status').text(`Acquiring JWT token for ${document.identity}`);
    
        $.get(`/token/${document.identity}`)
            .done(response => {
                console.log("Token: ", response.token);
                $('#status').text(`Got JWT token: <code>${response.token}</code>`);
                resolve(response.token);
            })
            .fail(err => {
                $('#status').text(`Failed to get JWT token: ${JSON.stringify(err)}`);
                console.error("Can't get token:", err);
            });
    });

    // Connect to Sync
    const createSyncClient = async token => new Promise((resolve, reject) => {
        const client = new Twilio.Sync.Client(token, { logLevel: 'info' });

        client.on('connectionStateChanged', function(state) {
            if (state == 'connected') {
                $('#status').text("Connected");
                resolve(client);
            } else {
                $('#status').text(`Error: ${error}`);
                reject(error);
            }
        });
    });

    const token = await getJwtToken();

    document.syncClient = await createSyncClient(token);

    $(document).trigger('sync-client-ready');
});