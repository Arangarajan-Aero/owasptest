using Newtonsoft.Json.Linq;
using StatusCenterDataLayer.Models;

namespace StatusCenterDataLayer.Repositories
{
    public interface IPIAccessRepository
    {
        Task<string> GetHomepagePIAccessDataAsync(List<string> units);
        Task<string> GetUnitDataForLoadTimeValueExport(string unitName, DateTime? dateTime = null);
    }
}