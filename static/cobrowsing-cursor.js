$(document).on('sync-client-ready', async () => {
    const identity = document.identity;
    const syncClient = document.syncClient;

    $('#participants').html(`<span class="badge badge-primary">${identity}</span>`)
    
    // Since Sync Map has pagination we need to navigate through all the pages
    const getAllParticipants = async map => {
        const result = [];
        let page = await map.getItems();
        result.push(...page.items);

        while (page.hasNextPage) {
            page = await page.nextPage();
            result.push(...page.items);
        }
        return result;
    };

    // Badges selectors helpers
    const hashCode = str => str
        .split('')
        .reduce((prevHash, currVal) => (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
    const getIdKey = (key, selector) => `${selector ? '#' : ''}participant-${hashCode(key)}`;
    const getCursorIdKey = (key, selector) => `${selector ? '#' : ''}cursor-${hashCode(key)}`;
    const getSignalIdKey = (key, selector) => `${selector ? '#' : ''}signal-${hashCode(key)}`;
    const getId = (participant, selector) => getIdKey(participant.key, selector);
    const getCursorId = (participant, selector) => getCursorIdKey(participant.key, selector);

    // Handlers to represent partipant changes in UI
    const onParticipantAdded = p => {
        if (p.key === identity) {
            return;
        }
        $('#participants').append(`<span id="${getId(p)}" class="badge badge-${p.value.active ? 'success' : 'secondary'}">${p.key}</span>`);
        $('#floating-badges').append(`<span id="${getCursorId(p)}" class="badge badge-pill badge-light floating-badge">❂ ${p.key}</span>`);        
    };
    const onParticipantRemoved = key => {
        $(getIdKey(key, true)).remove();
        $(getCursorIdKey(key, true)).remove();
    };
    const onParticipantUpdate = p => {
        if (p.key === identity) {
            return;
        }

        if (p.value.active) {
            $(getId(p, true)).removeClass('badge-secondary');
            $(getId(p, true)).addClass('badge-success');
        } else {
            $(getId(p, true)).addClass('badge-secondary');
            $(getId(p, true)).removeClass('badge-success');
        }
        $(getCursorId(p, true)).animate({
            left: p.value.x - 10,
            top: p.value.y - 10,
          },
        200);

        let signalSelector = $(getSignalIdKey(p.key, true));
        const signalDotExists = signalSelector.length > 0;

        if (p.value.mouseSignal) {
            if (!signalDotExists) {
                $('#signals').append(`<span class="dot" id="${getSignalIdKey(p.key)}"></span>`);
                signalSelector = $(getSignalIdKey(p.key, true));
            }
            signalSelector.css({ left: p.value.mouseSignal.x - 10, top: p.value.mouseSignal.y - 10 });
        } else if (signalDotExists) {
            signalSelector.remove();
        }
    };

    const map = await syncClient.map('users');

    // Adding existing participants
    const participants = await getAllParticipants(map);
    participants.filter(p => new Date(p.dateExpires) > new Date()).forEach(p => onParticipantAdded(p));

    // Keeping track of online participants
    map.on('itemAdded', args => onParticipantAdded(args.item));
    map.on('itemUpdated', args => onParticipantUpdate(args.item));
    map.on('itemRemoved', args => onParticipantRemoved(args.key));
    
    // Keeping track of own mouse position
    const updatesRate = 200;
    let updateOwnStateTimeout;
    let signalEndTimeout;
    let mouseOnPage = false;
    let mouseX = 0;
    let mouseY = 0;
    let mouseSignal = undefined;
    const updateOwnStatus = () => {
        map.set(identity, {
            x: mouseX,
            y: mouseY,
            active: mouseOnPage,
            mouseSignal: mouseSignal
        },
        {
            ttl: 60
        });
        updateOwnStateTimeout = null;
    };
    const triggerUpdate = () => {
        if (!updateOwnStateTimeout) updateOwnStateTimeout = setTimeout(() => updateOwnStatus(), updatesRate);
    }
    $(document).on('mousemove', event => {
        mouseOnPage = true;
        mouseX = event.pageX;
        mouseY = event.pageY;
        triggerUpdate();
    });
    $(document).click(event => {
        mouseSignal = {
            x: event.pageX,
            y: event.pageY
        };
        triggerUpdate();
        clearTimeout(signalEndTimeout);
        signalEndTimeout = setTimeout(() => {
            mouseSignal = null;
            triggerUpdate();
        }, 800);
    });
    $(document).mouseleave(() => {
        mouseOnPage = false;
        triggerUpdate();
    });
});