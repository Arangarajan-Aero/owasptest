using StatusCenterDataLayer.Models;
using StatusCenterDataLayer.Repositories;
using Microsoft.AspNetCore.Mvc;
using ConfigurationManagerDataLayer.Repositories;
using Newtonsoft.Json;
using System.Runtime.Versioning;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Newtonsoft.Json.Linq;
using System.Text;

namespace StatusCenter.Features
{
    public class HomeController : Controller
    {
        private IUnitInfoRepository unitInfoRepo;
        private IPIAccessRepository pIAccessRepo;
        private IFirmwareVersionRepository firmwareVersionRepo;
        private IManufacturingRepository manufacturingRepo;

        public HomeController(IUnitInfoRepository unitRepository, IPIAccessRepository pIAccessRepository, IFirmwareVersionRepository firmwareVersionRepository, IManufacturingRepository manufacturingRepo)
        {
            this.unitInfoRepo = unitRepository;
            this.pIAccessRepo = pIAccessRepository;
            this.firmwareVersionRepo = firmwareVersionRepository;
            this.manufacturingRepo = manufacturingRepo;
        }

        [Route("")]
        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> GetLatestFirmwareVersions()
        {
            return Json((await firmwareVersionRepo.GetAllAsync()).ToList());
        }

        public async Task<IActionResult> GetPiAccessData([FromBody] List<string> units) 
        {
            if (units?.Count == 0)
            {
                return BadRequest("Your request payload is null.");
            }

            var json = await pIAccessRepo.GetHomepagePIAccessDataAsync(units);

            return Content("{\"data\":" + json + "}", "application/json", System.Text.Encoding.UTF8);
        }


        public async Task<IActionResult> GetUnits()
        {
            var units = (await unitInfoRepo.GetAllAsync())
                                .Where(x => !(x.DeploymentTypeCode.Equals("lab", StringComparison.InvariantCultureIgnoreCase) ||
                                x.DeploymentTypeCode.Equals("virtual", StringComparison.InvariantCultureIgnoreCase))).ToList();

            return Json(new { data = units });
        }

        public async Task<IActionResult> GetMaintenanceLogAlerts()
        {
            var alerts = await manufacturingRepo.GetStatusCenterAlertsAsync();

            return Json(new { data = alerts });
        }

        [Route("ErrorTest")]
        public IActionResult ErrorTest()
        {
            throw new Exception("test error");
        }
    }
}
