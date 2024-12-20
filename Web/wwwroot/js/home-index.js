var adminFirmwareVersions;

$(function () {
    (async function () {
        const units = [];

        try {
            const [unitSqlDataResponse, adminFirmwareVersionsResponse, maintenanceLogAlertsResponse] = await Promise.all([
                $.ajax({
                    url: '/Home/GetUnits',
                    type: "POST",
                    dataType: 'json',
                    error: errorHandler
                }),
                $.ajax({
                    url: '/Admin/GetFirmwareVersions',
                    type: "GET",
                    dataType: 'json',
                    error: errorHandler
                }),
                $.ajax({
                    url: '/Home/GetMaintenanceLogAlerts',
                    type: "GET",
                    dataType: 'json',
                    error: errorHandler
                })
            ]);

            // Extracting data from responses
            const unitSqlData = unitSqlDataResponse.data;
            adminFirmwareVersions = adminFirmwareVersionsResponse.data;
            const alertsFromMES = maintenanceLogAlertsResponse.data || [];
            $.ajax({
                url: '/Home/GetPiAccessData',
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(unitSqlData.map(unit => unit.name)),
                dataType: 'json',
                error: errorHandler,
                success: (response) => {
                    if (response && response.data) {
                        units.push(...response.data.map(unit => ({
                            unitInfoFromSql: unitSqlData.find(val => val.name === unit.name),
                            alerts: alertsFromMES.filter(alert => alert.serialNumber === unit.name),
                            name: unit.name,
                            VersionA: formatData(unit, 'VersionA'),
                            VersionB: formatData(unit, 'VersionB'),
                            VersionC: formatData(unit, 'VersionC'),
                            VersionD: formatData(unit, 'VersionD'),
                            EL0062CDM1Version: formatData(unit, 'EL0062CDM1Version'),
                            EL0062CDM2Version: formatData(unit, 'EL0062CDM2Version'),
                            EL0115UPSVersion: formatData(unit, 'EL0115UPSVersion'),
                            EL0114HVPCVersion: formatData(unit, 'EL0114HVPCVersion'),
                            Inverter_FirmwareIntegrationLevel: formatData(unit, 'Inverter_FirmwareIntegrationLevel'),
                            Inverter_FirmwareBuildNumber: formatData(unit, 'Inverter_FirmwareBuildNumber'),
                            Converter_FirmwareIntegrationLevel: formatData(unit, 'Converter_FirmwareIntegrationLevel'),
                            Converter_FirmwareBuildNumber: formatData(unit, 'Converter_FirmwareBuildNumber'),
                            UPSConverter_FirmwareIntegrationLevel: formatData(unit, 'UPSConverter_FirmwareIntegrationLevel'),
                            UPSConverter_FirmwareBuildNumber: formatData(unit, 'UPSConverter_FirmwareBuildNumber')
                        })));

                        $('.spinner').hide();
                        initDataTable(units);
                    }
                }

            });//end ajax
        } catch (error) {
            console.error('An error occurred:', error);
        }
    })(); //end async function
    
    $(document).on('click', '.tableActions__refresh', function () {
        var table = $(this).closest('table').DataTable();
        var $rowElement = $(this).closest('tr');
        var row = table.row($rowElement);
        var unitName = row.data().name;

        $(this).addClass('spinning');

        // Make a new request to fetch the latest data
        $.ajax({
            url: '/Home/GetUnits',
            type: "POST",
            dataType: 'json',
            error: errorHandler,
            success: function (unitsResponse) {
                var rowToRefresh = unitsResponse.data.find(unit => unit.name === unitName);
                if (rowToRefresh) {
                    var filteredResponse = { data: [rowToRefresh] };

                    $.ajax({
                        url: '/Home/GetPiAccessData',
                        type: "POST",
                        contentType: 'application/json',
                        data: JSON.stringify(filteredResponse),
                        error: errorHandler,
                        success: function (piResponse) {
                            if (piResponse && piResponse.data && piResponse.data.length > 0) {
                                var unit = piResponse.data[0];

                                // Update the row data
                                var updatedData = {
                                    ...row.data(),
                                    VersionA: formatData(unit, 'VersionA'),
                                    VersionB: formatData(unit, 'VersionB'),
                                    VersionC: formatData(unit, 'VersionC'),
                                    VersionD: formatData(unit, 'VersionD'),
                                    EL0062CDM1Version: formatData(unit, 'EL0062CDM1Version'),
                                    EL0062CDM2Version: formatData(unit, 'EL0062CDM2Version'),
                                    EL0115UPSVersion: formatData(unit, 'EL0115UPSVersion'),
                                    EL0114HVPCVersion: formatData(unit, 'EL0114HVPCVersion'),
                                    Inverter_FirmwareIntegrationLevel: formatData(unit, 'Inverter_FirmwareIntegrationLevel'),
                                    Inverter_FirmwareBuildNumber: formatData(unit, 'Inverter_FirmwareBuildNumber'),
                                    Converter_FirmwareIntegrationLevel: formatData(unit, 'Converter_FirmwareIntegrationLevel'),
                                    Converter_FirmwareBuildNumber: formatData(unit, 'Converter_FirmwareBuildNumber'),
                                    UPSConverter_FirmwareIntegrationLevel: formatData(unit, 'UPSConverter_FirmwareIntegrationLevel'),
                                    UPSConverter_FirmwareBuildNumber: formatData(unit, 'UPSConverter_FirmwareBuildNumber')
                                };

                                row.data(updatedData).invalidate();
                                rowCreator(row, updatedData, row.index(), $rowElement.find('td').get());
                            }
                        },
                        complete: function () {
                            $rowElement.find('.tableActions__refresh').removeClass('spinning');
                        }
                    });
                }
            }
        });
    });


    $(document).on('click', '.sideBtn__toggle', function () {
        $(this).parents('.sideBtn__container').toggleClass('active');
    });

});

function formatData(unit, key) {
    const value = unit[key];
    const parsedInt = parseInt(value)
    return isNaN(parsedInt) ? '-' : parsedInt;
};

function buildFirmwareVersion(integrationLevel, buildNumber) {
    if (isNaN(parseInt(integrationLevel)) || isNaN(parseInt(buildNumber))) {
        return "-";
    }
    return 'IL' + parseInt(integrationLevel).toString().padStart(3, '0') + '_B' +
        parseInt(buildNumber).toString().padStart(2, '0');
}

function getFirmwareWarning(currentVersion) {
    var title = '';
    if (currentVersion && currentVersion.length)
        title = 'title="Current Version: ' + currentVersion + '"';
    return '<span class="oldFirmwareWarning" ' + title + '></span>';
}

function initDataTable(data) {
    if (!data) {
        alert('Data was empty. Stopping initialization of Datatables');
        return;
    }

    $('.dataTable').DataTable($.extend(dataTableDefaultOptions, {
        data: data,
        stateSave: false,
        dom: 'Bfrtip',
        language: {
            searchPanes: {
                //collapse: 'Filter' //has to be set here instead of on text property because it's a separate plugin
                collapse: { 0: 'Filter', _: 'Filter (%d)' }
            },

        },
        buttons: [{
            extend: 'excelHtml5',
            title: '', //if this is non-empty it will add a merged cell that breaks the customize function below (shift i-loop -1 to compensate)
            exportOptions: {
                format: {
                    body: function (data, row, column, node) {
                        if (node.textContent == '')
                            return '';
                        return data;
                    }
                }
            },
            className: 'btn',
            text: 'Export',
            customize: function (xlsx) {
                var sheet = xlsx.xl.worksheets['sheet1.xml'];
                // Loop over the cells
                for (var i = 0; i < $('row', sheet).length; i++) {
                    var row = $(`row:eq(${i})`, sheet);
                    for (var j = 0; j < $('c', row).length; j++) {
                        if ($(`.dataTable tr:eq(${i}) td:eq(${j})`).hasClass('outdated')) {
                            $(`c:eq(${j})`, row).attr('s', '10');
                        }
                    }
                }
            }
        }, {
            extend: 'searchPanes',
            className: 'btn',
            config: {
                threshold: 1,
                cascadePanes: true,
                order: ['Outdated', 'Name', 'Model', 'Controller Version', 'Inverter', 'Converter', 'UPS Converter', 'UPS', 'HVPC', 'CDM1', 'CDM2'],
                panes: [
                    {
                        header: 'Outdated',
                        options: [
                            {
                                label: 'Controller Version',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 2).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'Inverter',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 3).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'Converter',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 4).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'UPS Converter',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 5).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'UPS',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 6).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'HVPC',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 7).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'CDM1',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 8).node().classList.contains('outdated');
                                }
                            },
                            {
                                label: 'CDM2',
                                value: function (rowData, rowIndex) {
                                    return this.table().cell(rowIndex, 9).node().classList.contains('outdated');
                                }
                            }
                        ]
                    }
                ]
            }
        }, { extend: 'searchPanesClear', text: 'Clear Filter', className: 'btn' }],
        order: [[0, 'asc']],
        columns: [
            {
                data: 'name', title: 'Name', width: '150px', render: (data, type, row, meta) => {
                    if (row.alerts && row.alerts.length > 0) {
                        var title = row.alerts.length + ' Alerts';
                        var icon = $('<a class="maintenanceLogAlert" title="' + title + '" target="_blank" href="' + MFG_SITE_BASE_URL + '/Systems/Maintenance/Log?SelectedUnitID=' + row.alerts[0].id + '&NoteTypeFilter=35"><i class="fa fa-warning"></i></a>');
                        return data + $('<div>').append(icon).html();
                    }
                    return data;
                }
            },
            {
                name: 'Model', title: 'Model', width: '55px', render: (data, type, row, meta) => {
                    if (row.unitInfoFromSql.modelNumber == 8) {
                        return 'AC';
                    }
                    if (row.unitInfoFromSql.modelNumber == 9) {
                        return 'DC';
                    }
                    return 'EC';
                }
            },
            {
                name: 'Controller', title: 'Controller Version', render: (data, type, row, meta) => {
                    return [row.VersionA, row.VersionB, row.VersionC, row.VersionD].join('.');
                }
            },
            {
                name: 'Inverter', title: 'Inverter', width: '90px', render: (data, type, row, meta) => {
                    return buildFirmwareVersion(row.Inverter_FirmwareIntegrationLevel, row.Inverter_FirmwareBuildNumber);
                }
            },
            {
                name: 'Converter', title: 'Converter', width: '90px', render: (data, type, row, meta) => {
                    return buildFirmwareVersion(row.Converter_FirmwareIntegrationLevel, row.Converter_FirmwareBuildNumber);;
                }
            },
            {
                name: 'UPSConverter', title: 'UPS Converter', width: '90px', render: (data, type, row, meta) => {
                    return buildFirmwareVersion(row.UPSConverter_FirmwareIntegrationLevel, row.UPSConverter_FirmwareBuildNumber);
                }
            },
            {
                name: 'UPS', title: 'UPS', render: (data, type, row, meta) => {
                    return row.EL0115UPSVersion;
                }
            },
            {
                name: 'HVPC', title: 'HVPC', width: '50px', render: (data, type, row, meta) => {
                    return row.EL0114HVPCVersion;
                }
            },
            {
                name: 'CDM1', title: 'CDM1', render: (data, type, row, meta) => {
                    return row.EL0062CDM1Version;
                }
            },
            {
                name: 'CDM2', title: 'CDM2', render: (data, type, row, meta) => {
                    return row.EL0062CDM2Version;
                }
            },
            {
                name: 'actions',
                width: '55px',
                render: function (data, type, row, meta) {
                    result = '<div class="tableActions">';
                    /*result += '<a class="tableActions__item tableActions__default" href="/Configuration/Edit/' + row.id + '"><span style="display:block;"><i style="-webkit-animation: fa-spin 1s infinite linear; animation: fa-spin 1s infinite linear;" class="fas fa-sync"></i></span></a>'; //btn btn-xs btn-icon btn-link*/
                    result += '<button class="tableActions__item tableActions__refresh" title="Refresh PI data" data-id="' + row.id + '"><i class="fa fa-arrows-rotate"></i></button>';
                    //result += '<a class="tableActions__item" href="'/Compare/' + row.id + '"><i class="fa-solid fa-code-compare"></i></a>';
                    //result += '<button class="tableActions__item tableActions__delete" type="button" data-id="' + row.id + '"><i class="fa-solid fa-trash"></i></button>';
                    result += '</div>';
                    return result;
                },
                orderable: false
            }
        ],
        createdRow: rowCreator,
        initComplete: function () {
            this.api().columns('Model:name').header().to$().attr('title', '8=AC, 9=DC, 10=EC');
            this.api().columns('Controller:name').header().to$().attr('title', 'VersionA + VersionB + VersionC + VersionD');
            this.api().columns('Inverter:name').header().to$().attr('title', 'Inverter_FirmwareIntegrationLevel + Inverter_FirmwareBuildNumber');
            this.api().columns('Converter:name').header().to$().attr('title', 'Converter_FirmwareIntegrationLevel + Converter_FirmwareBuildNumber');
            this.api().columns('UPSConverter:name').header().to$().attr('title', 'UPSConverter_FirmwareIntegrationLevel + UPSConverter_FirmwareBuildNumber');
            this.api().columns('UPS:name').header().to$().attr('title', 'EL0115UPSVersion');
            this.api().columns('HVPC:name').header().to$().attr('title', 'EL0114HVPCVersion');
            this.api().columns('CDM1:name').header().to$().attr('title', 'EL0062CDM1Version');
            this.api().columns('CDM2:name').header().to$().attr('title', 'EL0062CDM2Version');
        }
    }));
}

function rowCreator(row, data, dataIndex, cells) {

    //cells[0] aka Name
    if (data.alerts && data.alerts.length > 0) {
        $(cells[0]).addClass('nameColumn');
    }
    else {
        $(cells[0]).removeClass('nameColumn');
    }

    //cells[2] aka Controller Version
    let adminVersA, adminVersB;

    if (data.unitInfoFromSql.modelNumber == 8) { //AC
        adminVersA = parseInt(adminFirmwareVersions.find(x => x.name == 'AC_VersionA').value);
        adminVersB = parseInt(adminFirmwareVersions.find(x => x.name == 'AC_VersionB').value);
    } else if (data.unitInfoFromSql.modelNumber == 9) { //DC
        adminVersA = parseInt(adminFirmwareVersions.find(x => x.name == 'DC_VersionA').value);
        adminVersB = parseInt(adminFirmwareVersions.find(x => x.name == 'DC_VersionB').value);
    }
    else if (data.unitInfoFromSql.modelNumber == 10) { //EC
        adminVersA = parseInt(adminFirmwareVersions.find(x => x.name == 'EC_VersionA').value);
        adminVersB = parseInt(adminFirmwareVersions.find(x => x.name == 'EC_VersionB').value);
    }

    $(cells[2]).removeClass('outdated').removeAttr('title');

    if (data.VersionA != adminVersA || data.VersionB != adminVersB || data.VersionC != 0 || data.VersionD != 0) {
        $(cells[2]).addClass('outdated').attr('title', adminVersA + '.' + adminVersB + '.0.0');
    }

    //cells[3] aka Inverter
    if ($(cells[3]).html() != '-') {
        //admin setting inverter1: 10|38, inverter2: 16|07
        //pi point 10|35 is outdated. 16|04 is outdated. 10|40 is in date, 16|09 is in date
        //the intent is that it matches IL first, then checks if build num is high enough
        //if there is no matching IL number, it is supposed to show outdated
        let inverter1 = adminFirmwareVersions.find(x => x.name == 'Inverter1').value.split('|');
        let inverter2 = adminFirmwareVersions.find(x => x.name == 'Inverter2').value.split('|');

        if (!(parseInt(inverter1[0]) == data.Inverter_FirmwareIntegrationLevel && data.Inverter_FirmwareBuildNumber >= parseInt(inverter1[1])) &&
            !(parseInt(inverter2[0]) == data.Inverter_FirmwareIntegrationLevel && data.Inverter_FirmwareBuildNumber >= parseInt(inverter2[1]))) { //!A && !B
            let latestFirmware = inverter1.join('|') +
                (inverter2 && inverter2.length > 1 ? ' or ' + inverter2.join('|') : '');
            $(cells[3]).addClass('outdated').attr('title', latestFirmware);
        }
        else {
            $(cells[3]).removeClass('outdated').removeAttr('title'); //else revert it
        }
    }

    //cells[4] aka Converter
    if ($(cells[4]).html() != '-') {
        let converter1 = adminFirmwareVersions.find(x => x.name == 'Converter1').value.split('|');
        let converter2 = adminFirmwareVersions.find(x => x.name == 'Converter2').value.split('|');

        if (!(parseInt(converter1[0]) == data.Converter_FirmwareIntegrationLevel && data.Converter_FirmwareBuildNumber >= parseInt(converter1[1])) &&
            !(parseInt(converter2[0]) == data.Converter_FirmwareIntegrationLevel && data.Converter_FirmwareBuildNumber >= parseInt(converter2[1]))) { //!A && !B
            let latestFirmware = converter1.join('|') +
                (converter2 && converter2.length > 1 ? ' or ' + converter2.join('|') : '');
            $(cells[4]).addClass('outdated').attr('title', latestFirmware);
        }
        else {
            $(cells[4]).removeClass('outdated').removeAttr('title');
        }
    }


    //cells[5] aka UPS Converter
    if ($(cells[5]).html() != '-') {
        let upsConverter1 = adminFirmwareVersions.find(x => x.name == 'UPSConverter1').value.split('|');
        let upsConverter2 = adminFirmwareVersions.find(x => x.name == 'UPSConverter2').value.split('|');

        if (!(parseInt(upsConverter1[0]) == data.UPSConverter_FirmwareIntegrationLevel && data.UPSConverter_FirmwareBuildNumber >= parseInt(upsConverter1[1])) &&
            !(parseInt(upsConverter2[0]) == data.UPSConverter_FirmwareIntegrationLevel && data.UPSConverter_FirmwareBuildNumber >= parseInt(upsConverter2[1]))) { //!A && !B
            let latestFirmware = upsConverter1.join('|') +
                (upsConverter2 && upsConverter2.length > 1 ? ' or ' + upsConverter2.join('|') : '');
            $(cells[5]).addClass('outdated').attr('title', latestFirmware);
        }
        else {
            $(cells[5]).removeClass('outdated').removeAttr('title');
        }
    }


    //cells[6] aka UPS
    if ($(cells[6]).html() != '-') {
        let adminUPS = parseInt(adminFirmwareVersions.find(x => x.name == 'EL0115UPSVersion').value);
        if (data.EL0115UPSVersion < adminUPS) {
            $(cells[6]).addClass('outdated').attr('title', adminUPS);
        }
        else {
            $(cells[6]).removeClass('outdated').removeAttr('title');
        }
    }


    //cells[7] aka HVPC
    if ($(cells[7]).html() != '-') {
        let adminHVPC = parseInt(adminFirmwareVersions.find(x => x.name == 'EL0114HVPCVersion').value);
        if (data.EL0114HVPCVersion < adminHVPC) {
            $(cells[7]).addClass('outdated').attr('title', adminHVPC);
        }
        else {
            $(cells[7]).removeClass('outdated').removeAttr('title');
        }
    }


    //cells[8] aka CDM1
    if ($(cells[8]).html() != '-') {
        let adminCDM1 = parseInt(adminFirmwareVersions.find(x => x.name == 'EL0062CDM1Version').value);
        if (data.EL0062CDM1Version < adminCDM1) {
            $(cells[8]).addClass('outdated').attr('title', adminCDM1);
        }
        else {
            $(cells[8]).removeClass('outdated').removeAttr('title');
        }
    }


    //cells[9] aka CDM2
    if ($(cells[9]).html() != '-') {
        let adminCDM2 = parseInt(adminFirmwareVersions.find(x => x.name == 'EL0062CDM2Version').value);
        if (data.EL0062CDM2Version < adminCDM2) {
            $(cells[9]).addClass('outdated').attr('title', adminCDM2);
        }
        else {
            $(cells[9]).removeClass('outdated').removeAttr('title');
        }
    }

}