$(document).on('sync-client-ready', async () => {
    const identity = document.identity;
    const syncClient = document.syncClient;

    // Since Sync Map has pagination we need to navigate through all the pages
    const getAllFields = async map => {
        const result = [];
        let page = await map.getItems();
        result.push(...page.items);

        while (page.hasNextPage) {
            page = await page.nextPage();
            result.push(...page.items);
        }
        return result;
    };

    // Locking fields focused
    const mapLocks = await syncClient.map('fields-locked');
    const onFieldLock = lock => {
        if (lock.value.author !== identity) {
            $(`#${lock.key}`).attr('readonly', true);
        }
    }
    mapLocks.on('itemAdded', args => onFieldLock(args.item));
    mapLocks.on('itemRemoved', args => $(`#${args.key}`).attr('readonly', false));

    // Read initial locks
    getAllFields(mapLocks).then(locks => locks
        .filter(lock => new Date(lock.dateExpires) > new Date())
        .forEach(lock => onFieldLock(lock)));

    // Updating map values
    const mapFields = await syncClient.map('fields');
    const onFieldUpdate = (item, force) => {
        if (item.value.author !== identity || force) {
            $(`#${item.key}`).val(item.value.value);
            $(`#${item.key}-author`).text(`by: ${item.value.author}`);
        }        
    };
    const onFieldCleanup = fieldId => {
        $(`#${fieldId}`).val("");
        $(`#${fieldId}-author`).text(`Edit me`);      
    };
    mapFields.on('itemAdded', args => onFieldUpdate(args.item));
    mapFields.on('itemUpdated', args => onFieldUpdate(args.item));
    mapFields.on('itemRemoved', args => onFieldCleanup(args.key));

    // Read initial fields
    getAllFields(mapFields).then(fields => fields.forEach(field => onFieldUpdate(field, true)));
    
    // Updating field
    $('.cb-input').focusin(async event => {
        const fieldId = $(event.target).attr('id');

        // Field already locked
        if ($(`#${fieldId}`).attr('readonly')) {
            $(`#${fieldId}`).blur();
        } else {
            mapLocks.set(fieldId, { author: identity }, { ttl: 60 });
        }        
    });
    $('.cb-input').focusout(event => {
        const fieldId = $(event.target).attr('id');

        if ($(`#${fieldId}`).attr('readonly')) {
            return;
        }

        mapLocks.remove(fieldId).catch(err => {});
    });

    let updateTimeout;
    const updateField = event => {
        updateTimeout = null;

        const fieldId = $(event.target).attr('id');

        if ($(event.target).val()) {
            mapFields.set(fieldId, {
                author: identity,
                value: $(event.target).val()
            });
        } else {
            mapFields.remove(fieldId).catch(err => {});
        }
        $(`#${fieldId}-author`).text(`by me`);
    }
    $('.cb-input').on('input', event => {
        // Renew lock
        const fieldId = $(event.target).attr('id');
        mapLocks.set(fieldId, { author: identity }, { ttl: 60 });

        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => updateField(event), 500);
    });
});