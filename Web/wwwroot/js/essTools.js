
(function ($) {
    $(document).ready(function () {
        addMarkers();
    });

    // add responsive size markers if they do not already exist
    var addMarkers = function () {
        var container = $('#gridMarkers');
        if (container.length === 0) {
            $('body').append('<div id="gridMarkers" aria-hidden="true"><div class="gridMarker__xs"></div><div class="gridMarker__sm hiddenXs"></div><div class="gridMarker__md hiddenXs hiddenSm"></div><div class="gridMarker__lg hiddenXs hiddenSm hiddenMd"></div><div class="gridMarker__xl hiddenXs hiddenSm hiddenMd hiddenLg"></div></div>');
        }
    };
}(jQuery));


// ################# UTILITY FUNCTIONS ###############

// BEGIN master "essTools" namespace wrapper
(function (essTools, $, undefined) {

    // get an object representing current visibility of responsive grid {sm,md,lg,smExact,mdExact,lgExact}
    essTools.getGridStatus = function () {
        var markers = $('#gridMarkers');
        var xsMarkerVis = $('.gridMarker__xs', markers).css('display') == 'block';
        var smMarkerVis = $('.gridMarker__sm', markers).css('display') == 'block';
        var mdMarkerVis = $('.gridMarker__md', markers).css('display') == 'block';
        var lgMarkerVis = $('.gridMarker__lg', markers).css('display') == 'block';
        var xlMarkerVis = $('.gridMarker__xl', markers).css('display') == 'block';

        var state = {
            xs: xsMarkerVis,
            sm: smMarkerVis,
            md: mdMarkerVis,
            lg: lgMarkerVis,
            xl: xlMarkerVis,
            xsExact: xsMarkerVis && !smMarkerVis && !mdMarkerVis && !lgMarkerVis && !xlMarkerVis,
            smExact: smMarkerVis && !mdMarkerVis && !lgMarkerVis && !xlMarkerVis,
            mdExact: mdMarkerVis && !lgMarkerVis && !xlMarkerVis,
            lgExact: lgMarkerVis && !xlMarkerVis,
            xlExact: xlMarkerVis
        };
        return state;
    };

    // get the value of a named parameter from the query string
    essTools.getQueryParam = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i");
        var results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    // get the value of a named parameter from the location.hash
    essTools.getHashParam = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\#&]" + name + "=([^&#]*)", "i");
        var results = regex.exec(location.hash);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

}(window.essTools = window.essTools || {}, jQuery));