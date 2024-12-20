
QUnit.module('formatData', function () {
    const unit = {
        "name": "EW-9",
        "Converter_FirmwareBuildNumber": 0,
        "Converter_FirmwareIntegrationLevel": 0,
        "EL0062CDM1Version": 0,
        "EL0062CDM2Version": 0,
        "Inverter_FirmwareBuildNumber": 0,
        "Inverter_FirmwareIntegrationLevel": 0,
        "VersionA": 1,
        "VersionB": 10,
        "VersionC": 0,
        "VersionD": 0
    };

    QUnit.test('formatData', function (assert) {
        assert.equal(formatData(unit, 'VersionA'), 1);
    });
    QUnit.test('formatData default response', function (assert) {
        assert.equal(formatData(unit, 'asdf'), '-');
    });
});

QUnit.module('buildFirmwareVersion', function () {
    QUnit.test('buildFirmwareVersion 10-38', function (assert) {
        assert.equal(buildFirmwareVersion(10, 38), 'IL010_B38')
    });

    QUnit.test('buildFirmwareVersion 1-3', function (assert) {
        assert.equal(buildFirmwareVersion(1, 3), 'IL001_B03')
    });

    QUnit.test('buildFirmwareVersion NaN', function (assert) {
        assert.equal(buildFirmwareVersion('asd', 'f'), '-')
    });
    
});