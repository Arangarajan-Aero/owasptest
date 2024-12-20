// tabs()
// jQuery plugin for "tab" behaviors with targeted hashtags that persist with back button.
// -----
// Call this plugin on a set of "tab" links with destination id in "href" (ex: "#overview")
// Content areas must have a matching attribute "data-tabs-id" (ex: data-tabs-id="overview")
// Some of the internal functions are overridable with settings
//
// sample call if your tab links have class "sharedtab":
// $('a.sharedtab').tabs();
//
// sample calls if you need multiple tab sets:
// $('a.maintab').tabs({ groupName:'primary' });
// $('a.sidetab').tabs({ groupName:'secondary' });
// -----
// created by Sean 05/6/2022

(function ($) {
    // default settings
    var optionsBase = {
        activeTabClass: 'active',
        activeBodyClass: 'active',
        groupName: 'global',
        getTabName: function (tabEl) {
            // get the "target name" string for this tab,
            // default behavior is read it from the href attribute and chop the #
            var linkhash = $(tabEl).attr('href');
            if (linkhash.indexOf('#') === 0 && linkhash.length > 1) {
                var cleantargetname = linkhash.substring(1);
                cleantargetname = cleantargetname.toLowerCase().replace(/[^a-z0-9]/g, "");
                return cleantargetname;
            } else {
                return '';
            }
        },
        getTabBody: function (targetName) {
            // given the target string, lookup the related tab body
            // default behavior is to look for an item with that ID
            return $('[data-tabs-id="' + targetName + '"]');
        },
        getTabMarkerElement: function (tabEl) {
            // given a tab element, get the 'element' that should be marked as active
            // default behavior is it just uses itself as a marker
            return $(tabEl);
        },
        isTabBodyEmpty: function (body) {
            // given a tab body element, return true if the element is considered 'empty'
            var content = '';
            if (body != null && body.length === 1) {
                content = $.trim(body.text());
            }
            return (content.length === 0);
        },
        tabsDefaultOpen: true,
        //set to false or a function that returns true when the accordion should be active
        accordion: function () {
            return essTools.getGridStatus().smExact || essTools.getGridStatus().xsExact;
        },
        accordionCloseOthers: true,
        accordionDefaultOpen: true,
        accordionSlideSpeed: 400,
        accordionHeaderClass: 'accordion__header',
        accordionContentClass: 'accordion__content'
    };

    // Plugin startup for Tabs, takes possible override options {activeTabClass, activeBodyClass, groupName, getTabName, getTabBody, getTabMarkerElement, isTabBodyEmpty, accordion, accordionCloseOthers}
    $.fn.tabs = function (options) {

        // use base options + overrides as our settings
        var settings = $.extend({}, optionsBase, options);
        var tabLinks = $(this);

        // loop through tabs and connect our tabs to their bodies!
        $(tabLinks).each(function () {
            // look up the appropriate tab/body by name
            var tabLink = $(this);
            var tabName = settings.getTabName(tabLink);
            var tabBody = settings.getTabBody(tabName);
            // mark the appropriate elements with the group name
            var fullgroupname = 'data-tabs-' + settings.groupName;
            tabLink.attr(fullgroupname + '-tab', tabName);
            tabBody.attr(fullgroupname + '-body', tabName);

            // automatically hide empty tabs
            if (settings.isTabBodyEmpty(tabBody)) {
                tabLink.hide();
                tabBody.hide();
            }

            //if a function is defined it will generate the proper wrapper html
            if (settings.accordion && !settings.isTabBodyEmpty(tabBody)) {
                //create accordion HTML
                $(tabBody).html('<div class="' + settings.accordionContentClass + '" style="display:none;">' + $(tabBody).html() + '</div>');
                $(tabBody).prepend('<a class="' + settings.accordionHeaderClass + ' tabs-' + settings.groupName + '" href="#' + tabName + '" data-accordion-' + settings.groupName + '-tab="' + tabName + '">' + tabLink.text() + '</a>');
            }
        });

        var accordionLinks = $('[data-accordion-' + settings.groupName + '-tab]');

        function getDefaultTabName() {

            if (!settings.tabsDefaultOpen) {
                return '';
            }

            //default tab name in settings
            var tabName = tabLinks.filter(':visible').first().attr('data-tabs-' + settings.groupName + '-tab');

            if ((tabName == null || tabName == '') && settings.accordion && settings.accordion() && settings.accordionDefaultOpen) {
                tabName = accordionLinks.filter(':visible').first().attr('data-accordion-' + settings.groupName + '-tab');
            }
            return tabName;
        }


        $('.' + settings.accordionHeaderClass + '.tabs-' + settings.groupName).on('click', function (e) {

            var tabContent = $(this).parent();
            if (tabContent.hasClass(settings.activeBodyClass)) {
                $(this).siblings('.' + settings.accordionContentClass).slideUp(function () {
                    tabContent.removeClass(settings.activeBodyClass);
                });
                history.pushState("", document.title, window.location.pathname + window.location.search); //does not trigger hashchange
                return false;
            }
        });


        // bind to the hashchange event to determine if user is requesting a content with hashtag (such as a named tab!)        
        $(window).on('hashchange.' + settings.groupName, function () {
            // gather all tab markers and bodies for this group
            var tabHrefs = [];
            var tabMarkers = $([]);
            for (var i = 0; i < tabLinks.length; i++) {
                var looplink = tabLinks.get(i);
                var tabMarkers = tabMarkers.add(settings.getTabMarkerElement(looplink));
                tabHrefs.push(settings.getTabMarkerElement(looplink).attr("href").substring(1));
            }
            var tabBodies = $('[data-tabs-' + settings.groupName + '-body]');

            // read the desired tabName from the browser hash
            var tabName = '';
            // first check in browser hash
            if (window.location.hash && window.location.hash.length > 1 && window.location.hash.substring(0, 1) == '#') {
                tabName = window.location.hash.substring(1);
            }

            //if tabName isnt in tabMarkers, check if it needs to be inited, otherwise bail            
            if (tabHrefs.indexOf(tabName) < 0) {
                var inited = false;
                tabBodies.each(function () {
                    if ($(this).hasClass('tabsInited') || $(this).hasClass(settings.activeBodyClass)) {
                        inited = true;
                        return false;
                    }
                    $(this).addClass('tabsInited'); //only want to run the default tabName once
                });
                if (inited)
                    return false;
                else
                    tabName = getDefaultTabName();
            }

            // assemble refs to the item we want to mark as "active"
            var activeTab = tabLinks.filter('[data-tabs-' + settings.groupName + '-tab="' + tabName + '"]');
            var activeMarker = settings.getTabMarkerElement(activeTab);
            var activeBody = tabBodies.filter('[data-tabs-' + settings.groupName + '-body="' + tabName + '"]');

            // on click, we want to mark the active item and un-marks all others in the group
            activeMarker.addClass(settings.activeTabClass);
            tabMarkers.not(activeMarker).removeClass(settings.activeTabClass);


            if (settings.accordion && settings.accordion()) {
                if (settings.accordionCloseOthers) {
                    activeBody.addClass(settings.activeBodyClass).children('.accordion__content').slideDown(settings.accordionSlideSpeed);
                    tabBodies.not(activeBody).children('.accordion__content').slideUp(settings.accordionSlideSpeed, function () {
                        $(this).parent().removeClass(settings.activeBodyClass);
                    });
                } else {
                    activeBody.slideDown(settings.accordionSlideSpeed, function () {
                        $(this).addClass(settings.activeBodyClass)
                    });
                }
            } else {
                //default behavior (toggles the class)
                if (settings.accordion) {
                    activeBody.addClass(settings.activeBodyClass).children('.accordion__content').show();
                }
                else {
                    activeBody.addClass(settings.activeBodyClass);
                }
                tabBodies.not(activeBody).removeClass(settings.activeBodyClass);
            }

        });
        // trigger a hash change on initial setup to make sure we initialize. Added group name for only one init per group
        $(window).trigger('hashchange.' + settings.groupName);

        // send back reference for chaining
        return $(this);
    };
}(jQuery));
