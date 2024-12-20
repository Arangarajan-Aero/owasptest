using System.Data;
using System.Data.SqlClient;
using Dapper;
using Dapper.Contrib.Extensions;
using StatusCenterDataLayer.Models;

namespace StatusCenterDataLayer.Repositories
{
    public class FirmwareVersionRepository : IFirmwareVersionRepository
    {
        private readonly string ConnectionString;

        public FirmwareVersionRepository(string connectionString)
        {
            ConnectionString = connectionString;
        }

        public virtual async Task<List<FirmwareVersion>> GetAllAsync()
        {
            var list = new List<FirmwareVersion>();
            using (SqlConnection connection = new SqlConnection(ConnectionString))
            {
                list = (await GetAllAsync(connection).ConfigureAwait(false)).ToList();
            }
            return list;
        }

        public virtual async Task<List<FirmwareVersion>> GetAllAsync(SqlConnection connection)
        {
            if (connection.State != ConnectionState.Open)
                connection.Open();

            return (await connection.QueryAsync<FirmwareVersion>("SELECT * FROM FirmwareVersions").ConfigureAwait(false)).ToList();
        }

        public virtual async Task UpdateAsync(FirmwareVersion firmwareVersions)
        {
            using (SqlConnection connection = new SqlConnection(ConnectionString))
            {
                await UpdateAsync(firmwareVersions, connection).ConfigureAwait(false);
            }
        }

        public virtual async Task UpdateAsync(FirmwareVersion firmwareVersions, SqlConnection connection)
        {
            if (connection.State != ConnectionState.Open)
                connection.Open();

            await connection.UpdateAsync(firmwareVersions);
        }
    }
}