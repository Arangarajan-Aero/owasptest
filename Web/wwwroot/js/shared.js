const ConfigurationTypes = {
    Snapshot: 1,
    AutoBackup: 2,
    Custom: 3,
    Default: 4
};
Object.freeze(ConfigurationTypes);
const MFG_SITE_BASE_URL = 'https://mes.essinc.com';

AjaxRequestPending = null;

$(function () {

    $.isNumber = function (value) { //jquery got rid of this for some reason. This future proofs our code.
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    //overwrites standard jquery :contains to ignore case when searching
    $.expr[':'].contains = $.expr.createPseudo(function (arg) {
        return function (elem) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });

    $('.typeAhead').select2({ dropdownAutoWidth: true });

    //fix for broken focus with jquery 3.60 and select2 plugin
    $(document).on('select2:open', () => {
        setTimeout(() => { document.querySelector('.select2-container--open .select2-search__field').focus(); }, 125);
        document.querySelector('.select2-container--open .select2-search__field').focus();
    });

    $('.tabs').tabs();

    $(window).on('scroll', function () {

        if ($(this).scrollTop() == 0) {
            $('body').removeClass('scrolling');
        } else {
            $('body').addClass('scrolling');
        }

        //if ($(this).scrollTop() == 0 && $('body').hasClass('scrolling')) {
        //    $('body').removeClass('scrolling');
        //} else if (!$('body').hasClass('scrolling')) {
        //    $('body').addClass('scrolling');
        //}
    });

    //keyboard accessbility for checkboxes
    $(document).on('keypress', 'input[type="checkbox"]', function (e) {
        if (e.keyCode == 13) {
            $(this).trigger('click');
        }
    });

    //setup for clicking a row -> call default action behavior        
    $(document).on('click', '.dataTable tr', function (evt) {
        var containsLink = $(evt.target).closest('a');

        if (containsLink.length <= 0 && evt.which == 1) { //evt.which 1 captures mouse left-click             
            var defaultActions = $(this).find('.tableActions__default');
            if (defaultActions.length > 0) {
                var defaultAction = $(defaultActions.get(0));
                if (defaultAction.attr('data-toggle') != null) { //send user to either a data-toggle click for actions on the page, or to the href to visit another page                    
                    defaultAction.click();
                }
                else {
                    defaultAction.show();
                    if (evt.ctrlKey || evt.shiftKey)
                        window.open(defaultAction.attr('href'), '_blank');
                    else
                        window.location = defaultAction.attr('href');
                }
                return false;
            }
        }
        return true;
    });

    $(document).on('click', '.accordion__header:not(.accordion__disabled)', function (e, slideDurr) {

        var slideDuration = 100;
        if (slideDurr != undefined && slideDurr != null) //overridable slide duration
            slideDuration = slideDurr;

        var parent = $(this).parent();
        if (parent.hasClass('active')) {
            if (slideDuration > 0) {
                //closing
                $(this).siblings('.accordion__body').slideUp(slideDuration, function () {
                    parent.removeClass('active');
                });
            }
            else {
                //closing
                $(this).siblings('.accordion__body').hide();
                parent.removeClass('active');
            }
        }
        else {
            $(this).siblings('.accordion__body').trigger('accordionOpen');
            var context = $(this);
            if (slideDuration > 0) {
                //opening
                //$('.accordion.active .accordion__header').trigger('click'); //uncomment this to cause all other accordions to collapse when one is opened
                $(this).parent().addClass('active').children('.accordion__body').slideDown(slideDuration, function () {
                    context.siblings('.accordion__body').trigger('accordionOpened');
                });
            }
            else {
                //closing
                $(this).parent().addClass('active').children('.accordion__body').show();
                $(this).siblings('.accordion__body').trigger('accordionOpened');
            }
        }
    });

    $(document).on('keyup', '.accordion__header', function (e) {
        if (e.code == 'Enter')
            $(this).trigger('click');
    });

    //accordion filter functionality is used on the Compare page
    $(document).on('click', '.accordionFilter__clear', function () {
        $('.accordionFilter__container .active').removeClass('active');
        $('.accordionFilter__container [type="checkbox"]').prop('checked', false);

        $('.accordionFilter').val('').trigger('keyup');
    });

    $(document).on('click', '.accordionFilter__container .btn:not(.accordionFilter__clear)', function () {
        var checkbox = $(this).siblings('.' + $(this).data('checkbox'));
        checkbox.prop('checked', !checkbox.prop('checked')); //toggle checked
        $(this).toggleClass('active');

        //generally runs things needed PRIOR to the hide checks like ValidateForm()
        $(document).trigger('customFilterBehavior__click', [checkbox, $(this)]); //$(this) is the btn

        $('.accordionFilter').trigger('keyup');
    });

    $(document).on('keyup', '.accordionFilter', function () {
        $('.accordion.hidden').removeClass('hidden');
        var filtersApplied = false;
        if ($(this).val().length > 0 ||
            ($('.accordionFilter__container [type="checkbox"]').length > 0
                && $('.accordionFilter__container [type="checkbox"]').filter(function () { return $(this).prop('checked'); }).length > 0)) {
            //true if text is entered in the box or if checkbox type filter is applied

            $('.accordion__header .searchable:not(:contains("' + $(this).val() + '"))').closest('.accordion').addClass('hidden'); //contains ignores letter case because of jquery override in shared.js

            //generally only hides the accordions NOT under search criteria
            $(document).trigger('customFilterBehavior__keyup');
            filtersApplied = true;
        }

        $('.typeAccordion').each(function () {
            if ($(this).find('.accordion').length == 0 && filtersApplied) { //short circuit for typeAccordions with 0 children
                $(this).addClass('hidden');
                return;
            }

            var firstHiddenAccordion = $(this).children('.accordion__body').children('.accordion.hidden').first();

            if (firstHiddenAccordion.length == 0) { //no hidden items
                return;
            }

            if (firstHiddenAccordion.siblings('.accordion:not(.hidden)').length == 0) { //if the child accordion has NO accordion siblings that are visible, hide the parent
                $(this).addClass('hidden');
            }
        });
    });

    $('body').append('<div class="easterEgg" title="you found the easter egg!"></div>');
    $(document).on({
        mouseenter: function (e) {
            $('tbody').addClass('spinning');
        },
        mouseleave: function (e) {
            $('tbody').removeClass('spinning');
        }
    }, ".easterEgg");
});

var dataTableDefaultOptions = {
    stateSave: true,
    stateSaveCallback: dataTableListStateSaveCallback,
    stateLoadCallback: dataTableListStateLoadCallback,
    paging: false,
    info: false,
    stripeClasses: ['dataTable__odd', 'dataTable__even'],
    columnDefs: [{
        defaultContent: '',
        targets: '_all'
    }],
};

function dataTableListStateSaveCallback(oSettings, oData) {
    localStorage.setItem("DataTables_" + btoa(window.location.href), JSON.stringify(oData))
}

function dataTableListStateLoadCallback(oSettings, oData) {
    return JSON.parse(localStorage.getItem("DataTables_" + btoa(window.location.href)));
}

function errorHandler(response, _, statusText, additionalHandler) {
    if (response.responseJSON && response.responseJSON.detail)
        alert(response.status + ': ' + response.responseJSON.detail);
    else if (response.responseText)
        alert(response.responseText);
    else
        alert(response.status);

    if (additionalHandler) {
        additionalHandler();
    }
}