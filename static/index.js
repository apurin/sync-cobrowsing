$(document).ready(async () => {
    // Enable "Start" button when name entered
    $("#input-name").on('input', () => {
        const nameEmpty = $("#input-name").val() === "";
        $("#button-start").prop('disabled', nameEmpty);
    });

    // Open tab with cursor and pass name as query param
    const openCobrowsing = () => {
        const name = $("#input-name").val();
        window.location.replace(`/cobrowsing.html?name=${encodeURIComponent(name)}`);
    };
    
    $("#button-start").click(openCobrowsing);
    
    $("#input-name").keypress(event => {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if(keycode == '13'){
            openCobrowsing();  
        }
    });
});