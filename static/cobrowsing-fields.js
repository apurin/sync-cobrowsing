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

    const onFieldUpdate = item => {
        if (item.value.author === identity) {
            return;
        }
        $(`#${item.key}`).attr('readonly', item.value.locked);
        $(`#${item.key}`).val(item.value.value);
        $(`#${item.key}-author`).text(`by: ${item.value.author}`);
    };

    const map = await syncClient.map('fields');

    map.on('itemAdded', args => onFieldUpdate(args.item));
    map.on('itemUpdated', args => onFieldUpdate(args.item));

    getAllFields(map).then(fields => fields.forEach(f => onFieldUpdate(f)));

    // Updating field
    $('.cb-input').focusin(event => {
        console.log(`active`);
        const fieldId = $(event.target).attr('id')
        map.set(fieldId, {
            author: identity,
            locked: true,
            value: $(event.target).val()
        });
        $(`#${fieldId}-author`).text(`by me`);
    });
    $('.cb-input').focusout(event => {
        console.log(`focusout`);
        const fieldId = $(event.target).attr('id');
        map.set(fieldId, {
            author: identity,
            locked: false,
            value: $(event.target).val()
        });
    });
    $('.cb-input').on('input', event => {
        console.log(`input`);
        const fieldId = $(event.target).attr('id');
        map.set(fieldId, {
            author: identity,
            locked: true,
            value: $(event.target).val()
        });

        $(`#${fieldId}-author`).text(`by me`);
    });
});