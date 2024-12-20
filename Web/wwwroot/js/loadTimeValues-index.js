$(function () {
    var units = [];

    $('#nowCheckbox').checkboxradio();
    
    $('#nowCheckbox').on('change', function () {
        if ($(this).is(':checked')) {
            $('#dateInput').val(null).prop('disabled', true).hide();
            $('#timeInput').val(null).prop('disabled', true).hide();
            $('#dateTimeInput').val(null);
        } else {
            $('#dateInput').val('').prop('disabled', false).show();
            $('#timeInput').val('').prop('disabled', false).show();
        }
    });

    var unitSqlDataRequest = $.ajax({
        url: '/Home/GetUnits',
        type: "POST",
        dataType: 'json',
        error: errorHandler,
        success: (response) => {
            for (var i = 0; i < response.data.length; i++) {
                $('.units').append('<option value="' + response.data[i].name + '">' + response.data[i].name + '</option>')
            }

            $('.units').select2({ width: 200 });
            return response;
        }
    });

    function updateDateTimeInput() {
        var date = $('#dateInput').val();
        var time = $('#timeInput').val();
        if (date && time) {
            $('#dateTimeInput').val(date + ' ' + time);
        }
    }

    $('#dateInput').datepicker({
        dateFormat: 'yy-mm-dd',
        onSelect: function () {
            updateDateTimeInput();
        }
    });

    $('#timeInput').timepicker({
        step: 30,
        minTime: '00:00am',
        maxTime: '11:59pm',
        defaultTime: '12:00',
        startTime: '00:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true,
        onSelect: function () {
            updateDateTimeInput();
        }
    });

    $(document).on('click', '.goBtn', function () {
        if ($('.units').val() == -1 || $('.units').val() == '-1') {
            return;
        }

        var date = $('#dateInput').val();
        var time = $('#timeInput').val();
        if (date && time) {
            $('#dateTimeInput').val(date + ' ' + time);
        } else {
            $('#dateTimeInput').val(null);
        }

        if (!AjaxRequestPending) {
            var oldBtnHtml = $(this).html();
            $('.export').removeClass('active');
            $('.export__json').removeClass('active');
            $(this).html('<span style="display:block;"><i style="-webkit-animation: fa-spin 1s infinite linear; animation: fa-spin 1s infinite linear;" class="fas fa-sync"></i></span>');
            AjaxRequestPending = $.ajax({
                url: `/LoadTimeValues/GetLoadTimeValuesFromPIAccessAtTime?time=${encodeURIComponent($('#dateTimeInput').val())}&unitName=${ $('.units').val() }`,
                type: "POST",
                contentType: 'application/json',
                error: errorHandler,
                success: (response) => {
                    if (response && response.data) {
                        var mappedValues = response.data;

                        if ($.fn.DataTable.isDataTable('.results')) {
                            $('.results').DataTable().destroy();
                        }
                        $('.results').DataTable($.extend(dataTableDefaultOptions, {
                            data: mappedValues,
                            columns: [
                                { data: 'name', title: 'Name', width: '150px', render: (data, type, row, meta) => { return data; } },
                                { data: 'value', title: 'Value', width: '55px', render: (data, type, row, meta) => { return data; } },
                            ]
                        }));
                        $('.export').addClass('active');
                        $('.export__json').addClass('active');
                    }
                },
                complete: () => {
                    $(this).html(oldBtnHtml);
                    AjaxRequestPending = null;
                }
            });
        }
    });

    $('.export__json').on('click', function () {
        $.ajax({
            url: `/LoadTimeValues/ExportToJSON?time=${encodeURIComponent($('#dateTimeInput').val())}&unitName=${ $('.units').val() }`,
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                const blob = new Blob([response], { type: 'application/zip' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `CompressedLoadTimeValues${$('.units').val()}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Export failed:', textStatus, errorThrown);
            },
            xhrFields: {
                responseType: 'blob'
            }
        });
    });

    // Unbind any existing click events on the .export button before adding a new one
    $('.export').on('click', function () {
        $.ajax({
            url: `/LoadTimeValues/Export?time=${encodeURIComponent($('#dateTimeInput').val())}&unitName=${ $('.units').val() }`,
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                const blob = new Blob([response], { type: 'application/zip' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `CompressedLoadTimeValues${ $('.units').val() }.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Export failed:', textStatus, errorThrown);
            },
            xhrFields: {
                responseType: 'blob'
            }
        });
    });

    $(document).on('click', '.sideBtn__toggle', function () {
        $(this).parents('.sideBtn__container').toggleClass('active');
    });
});
