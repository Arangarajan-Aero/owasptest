using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Linq;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using StatusCenterDataLayer.Repositories;


namespace Test
{
    public class UnitTest_DoWorkOnResponse : PIAccessRepository
    {
        [Test]
        public async Task DoWorkOnResponse_ValidResponse_ReturnsJObject()
        {
            // Arrange
            var responseContent = """
                [
                    {"name":"Converter_FirmwareBuildNumber","value":13.0},
                    {"name":"Converter_FirmwareIntegrationLevel","value":18.0},
                    {"name":"EL0062CDM1Version","value":0.0},
                    {"name":"EL0062CDM2Version","value":0.0},
                    {"name":"EL0114HVPCVersion","value":3.0},
                    {"name":"EL0115UPSVersion","value":1.0},
                    {"name":"Inverter_FirmwareBuildNumber","value":38.0},
                    {"name":"Inverter_FirmwareIntegrationLevel","value":10.0},
                    {"name":"UPSConverter_FirmwareBuildNumber","value":7.0},
                    {"name":"UPSConverter_FirmwareIntegrationLevel","value":16.0},
                    {"name":"VersionA","value":1.0},
                    {"name":"VersionB","value":16.0},
                    {"name":"VersionC","value":0.0},
                    {"name":"VersionD","value":0.0}
                ]
            """;

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(responseContent)
            };
            var unitName = "EW-49";

            // Act
            var result = await PIAccessRepository.DoWorkOnResponse(response, unitName);

            // Assert
            Assert.NotNull(result);

            if (result != null)
            {
                Assert.That(result["name"].ToString() ?? "", Is.EqualTo(unitName));
                Assert.That((double)(result["Converter_FirmwareBuildNumber"] ?? -1), Is.EqualTo(13.0));
                Assert.That((double)(result["Converter_FirmwareIntegrationLevel"] ?? -1), Is.EqualTo(18.0));
                Assert.That((double)(result["EL0062CDM1Version"] ?? -1), Is.EqualTo(0.0));
                Assert.That((double)(result["EL0062CDM2Version"] ?? -1), Is.EqualTo(0.0));
                Assert.That((double)(result["EL0114HVPCVersion"] ?? -1), Is.EqualTo(3.0));
                Assert.That((double)(result["EL0115UPSVersion"] ?? -1), Is.EqualTo(1.0));
                Assert.That((double)(result["Inverter_FirmwareBuildNumber"] ?? -1), Is.EqualTo(38.0));
                Assert.That((double)(result["Inverter_FirmwareIntegrationLevel"] ?? -1), Is.EqualTo(10.0));
                Assert.That((double)(result["UPSConverter_FirmwareBuildNumber"] ?? -1), Is.EqualTo(7.0));
                Assert.That((double)(result["UPSConverter_FirmwareIntegrationLevel"] ?? -1), Is.EqualTo(16.0));
                Assert.That((double)(result["VersionA"] ?? -1), Is.EqualTo(1.0));
                Assert.That((double)(result["VersionB"] ?? -1), Is.EqualTo(16.0));
                Assert.That((double)(result["VersionC"] ?? -1), Is.EqualTo(0.0));
                Assert.That((double)(result["VersionD"] ?? -1), Is.EqualTo(0.0));
            }
        }

        [Test]
        public async Task DoWorkOnResponse_EmptyResponse_ReturnsNull()
        {
            // Arrange
            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(string.Empty)
            };
            var unitName = "EW-49";

            // Act
            var result = await PIAccessRepository.DoWorkOnResponse(response, unitName);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task DoWorkOnResponse_ServerErrorResponse_ReturnsNull()
        {
            // Arrange
            var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
            {
                Content = new StringContent(@"{""error"": ""Something Terrible occurred.""}")
            };
            var unitName = "EW-49";

            // Act
            var result = await PIAccessRepository.DoWorkOnResponse(response, unitName);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task DoWorkOnResponse_ErrorResponse_ReturnsNull()
        {
            // Arrange
            var response = new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("Error occurred")
            };
            var unitName = "EW-49";

            // Act
            var result = await PIAccessRepository.DoWorkOnResponse(response, unitName);

            // Assert
            Assert.IsNull(result);
        }
    }


}