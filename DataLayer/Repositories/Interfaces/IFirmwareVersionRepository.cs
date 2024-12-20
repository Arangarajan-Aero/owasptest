using Dapper;
using Dapper.Contrib.Extensions;
using StatusCenterDataLayer.Models;
using System.Data.SqlClient;

namespace StatusCenterDataLayer.Repositories
{
    public interface IFirmwareVersionRepository
    {
        Task<List<FirmwareVersion>> GetAllAsync();
        Task<List<FirmwareVersion>> GetAllAsync(SqlConnection connection);

        Task UpdateAsync(FirmwareVersion firmwareVersions);
        Task UpdateAsync(FirmwareVersion firmwareVersions, SqlConnection connection);
    }
}
