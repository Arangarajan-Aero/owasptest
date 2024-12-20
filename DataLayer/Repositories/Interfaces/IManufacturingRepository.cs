using Dapper;
using Dapper.Contrib.Extensions;
using StatusCenterDataLayer.Models;
using System.Data.SqlClient;

namespace StatusCenterDataLayer.Repositories
{
    public interface IManufacturingRepository
    {
        Task<List<MaintenanceLog>> GetStatusCenterAlertsAsync();
    }
}
