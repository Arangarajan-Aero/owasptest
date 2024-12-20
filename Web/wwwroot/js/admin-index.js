$(function () {
    $.ajax({
        url: '/Admin/GetFirmwareVersions',
        type: "GET",
        dataType: 'json',
        error: errorHandler,
        success: (response) => {
            if (response && response.data && response.data.length > 0) {
                for (var i = 0; i < response.data.length; i++) {
                    var item = response.data[i];
                    $('input[name="' + item.name + '"]').val(item.value).data('id', item.id);
                }
            }
        }
    });

    $(document).on('change', '.firmwareVersion__input', function () {
        var input = $(this);

        input.closest('label').append('<span class="updating">-</span>');
        $.ajax({
            url: '/Admin/SetFirmwareVersion',
            type: "POST",
            data: { id: input.data('id'), name: input.attr('name'), value: input.val() },
            dataType: 'json',
            error: errorHandler,
            success: (response) => {
                if (response) {
                    var checkmark = input.closest('label').find('.updating');
                    checkmark.addClass('success').html('&check;');
                    checkmark.animate({ opacity: 0 }, {
                        duration: 2000,
                        complete: () => {
                            checkmark.remove();
                        }
                    });
                }
            }
        });
    });
});
