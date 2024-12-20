using ESS.Web;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using StatusCenterDataLayer.Repositories;
using System.Data.SQLite;
using System.Globalization;
using System.IO.Compression;
using System.Text;

namespace StatusCenter.Features
{
    public class LoadTimeValuesController : Controller
    {
        private readonly IPIAccessRepository PIAccessRepo;
        private readonly IWebHostEnvironment WebHostEnvironment;
        public LoadTimeValuesController(IWebHostEnvironment webHostEnvironment, IPIAccessRepository pIAccessRepository)
        {
            this.PIAccessRepo = pIAccessRepository;
            WebHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }

        public async Task<IActionResult> GetLoadTimeValuesFromPIAccessAtTime(string unitName, string time)
        {
            if (string.IsNullOrEmpty(unitName))
            {
                return BadRequest($"{unitName} is invalid.");
            }

            DateTime? lookupTime;
            if (!string.IsNullOrEmpty(time))
            {
                if (!DateTime.TryParse(time, new CultureInfo("en-US"), out var parsedlookupTime))
                {
                    throw new FormatException($"Unable to parse Date Time {time}");
                }
                lookupTime = parsedlookupTime;
            }
            else
            {
                lookupTime = null;
            }

            var json = await PIAccessRepo.GetUnitDataForLoadTimeValueExport(unitName, lookupTime);

            return Content("{\"data\":" + json + "}", "application/json", System.Text.Encoding.UTF8);
        }
        public async Task<IActionResult> ExportToJSON(string unitName, string type, string time)
        {
            if (string.IsNullOrEmpty(unitName))
            {
                return BadRequest($"{unitName} is invalid.");
            }

            DateTime? lookupTime;
            if (!string.IsNullOrEmpty(time))
            {
                if (!DateTime.TryParse(time, new CultureInfo("en-US"), out var parsedlookupTime))
                {
                    throw new FormatException($"Unable to parse Date Time {time}");
                }
                lookupTime = parsedlookupTime;
            }
            else
            {
                lookupTime = null;
            }

            var json = await PIAccessRepo.GetUnitDataForLoadTimeValueExport(unitName, lookupTime);

            if (!Directory.Exists(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles")))
            {
                Directory.CreateDirectory(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles"));
            }

            var filePath = Path.Combine(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles"), "ControllerLoadTimeValues_" + DateTime.Now.Ticks + ".json");

            //write the dictionary to a sqlite DB
            try
            {
                await System.IO.File.WriteAllTextAsync(filePath, json);

                if (!System.IO.File.Exists(filePath))
                {
                    return Problem(detail: "File Write error, no file written");
                }

                using (MemoryStream ms = new())
                {
                    using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, true))
                    {
                        archive.CreateEntryFromFile(filePath, "LoadTimeValues.json", CompressionLevel.Fastest);
                    }
                    return File(ms.ToArray(), "application/zip", "CompressedLoadTimeValues" + unitName + ".zip", false);
                }
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        public async Task<IActionResult> Export(string unitName, string type, string time)
        {
            if (string.IsNullOrEmpty(unitName))
            {
                return BadRequest($"{unitName} is invalid.");
            }

            DateTime? lookupTime;
            if (!string.IsNullOrEmpty(time))
            {
                if (!DateTime.TryParse(time, new CultureInfo("en-US"), out var parsedlookupTime))
                {
                    throw new FormatException($"Unable to parse Date Time {time}");
                }
                lookupTime = parsedlookupTime;
            }
            else
            {
                lookupTime = null;
            }

            var json = await PIAccessRepo.GetUnitDataForLoadTimeValueExport(unitName, lookupTime);

            JArray itemsArray = JArray.Parse(json);

            if (!Directory.Exists(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles")))
            {
                Directory.CreateDirectory(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles"));
            }

            var filePath = Path.Combine(Path.Combine(WebHostEnvironment.WebRootPath, "TempFiles"), "ControllerLoadTimeValues_" + DateTime.Now.Ticks + ".sqlite");

            //write the dictionary to a sqlite DB
            try
            {
                SQLiteConnectionStringBuilder connectionString_LoadTimeValues = new SQLiteConnectionStringBuilder()
                {
                    DataSource = filePath,
                    JournalMode = SQLiteJournalModeEnum.Off,
                    SyncMode = SynchronizationModes.Off,
                    BaseSchemaName = "dbo",
                };
                connectionString_LoadTimeValues.Add("New", true);


                using (SQLiteConnection _con = new SQLiteConnection(connectionString_LoadTimeValues.ConnectionString))
                {
                    await _con.OpenAsync();

                    using (SQLiteCommand cmd = new("CREATE TABLE LoadTimeValues (Name TEXT NOT NULL, Value REAL, PRIMARY KEY(Name))", _con)) await cmd.ExecuteNonQueryAsync();

                    var sb = new StringBuilder();

                    foreach (var item in itemsArray)
                    {
                        sb.Append("('" + item["name"] + "'," + TextUtil.GetSafeDouble(item["value"], 0) + "),");
                    }

                    var valuesToInsert = sb.ToString().Trim(',');
                    var insertStatement = $"INSERT INTO LoadTimeValues (Name, Value) VALUES {valuesToInsert}";

                    using (SQLiteCommand cmd = new(insertStatement, _con)) await cmd.ExecuteNonQueryAsync();
                }

                if (!System.IO.File.Exists(filePath))
                {
                    return Problem(detail: "File Write error, no file written");
                }

                using (MemoryStream ms = new())
                {
                    using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, true))
                    {
                        archive.CreateEntryFromFile(filePath, "LoadTimeValues.sqlite", CompressionLevel.Fastest);
                    }
                    return File(ms.ToArray(), "application/zip", "CompressedLoadTimeValues" + unitName + ".zip", false);
                }
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        [Route("ErrorTest")]
        public IActionResult ErrorTest()
        {
            throw new NotImplementedException("test error");
        }
    }
}
