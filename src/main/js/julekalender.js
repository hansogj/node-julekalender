$(document).ready(function () {
    var $btn = $('button');
    var interval;
    function display(data) {
        var date = new Date();
        $('.xmasstree').fadeIn(200);
        $btn.replaceWith('<h1 class="moremargin">Vinner ' + date.getDate() + ' desember   er: <br /><br />' +
                         data.winner +'</blink> </h1>');
    }


    function before() {
        function a (){
            $x = $('.xmasstree');
            if($x.is(':visible')) {$x.fadeOut(200)}else {$x.fadeIn(200)}
        }

        interval = setInterval(a, 201);
        $btn.hide();



    }

    $btn.on('click', function () {
        $.ajax({

            url : '/pick.json',
            beforeSend : before,
            success: function (data) {

                setTimeout(function () {
                    window.clearInterval(interval);
                    display(data);}, 5000);
            },
            error : function (err, a) {
                clearInterval(interval);
                display(err);
            }

        });
        return false;
    });
});