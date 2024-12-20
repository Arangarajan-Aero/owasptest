using StatusCenterDataLayer.Models;
using StatusCenterDataLayer.Repositories;
using Microsoft.AspNetCore.Mvc;
using ConfigurationManagerDataLayer.Repositories;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;

//using StatusCenterDataLayer.Models;
//using StatusCenterDataLayer.Repositories;

namespace StatusCenter.Features
{
    [Authorize(Roles = "INT\\Engineering_sec")]
    public class AdminController : Controller
    {
        private IFirmwareVersionRepository firmwareVersionRepo;
        public AdminController(IFirmwareVersionRepository firmwareVersionRepository)
        {
            this.firmwareVersionRepo= firmwareVersionRepository;
        }

        [Route("/Admin")]
        public IActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        public async Task<IActionResult> GetFirmwareVersions()
        {
            return Json(new { data = await firmwareVersionRepo.GetAllAsync() });
        }

        //add auth attributes
        public async Task<IActionResult> SetFirmwareVersion(FirmwareVersion firmwareVersion)
        {
            try
            {
                await firmwareVersionRepo.UpdateAsync(firmwareVersion);
                return Json(new { success = true });
            }
            catch(Exception ex) 
            {
                return Problem(detail: ex.Message);
            }
        }

    }
}
