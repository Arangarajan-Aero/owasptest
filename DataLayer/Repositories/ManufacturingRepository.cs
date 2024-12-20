using System.Data;
using System.Data.SqlClient;
using Dapper;
using Dapper.Contrib.Extensions;
using StatusCenterDataLayer.Models;

namespace StatusCenterDataLayer.Repositories
{
    public class ManufacturingRepository : IManufacturingRepository
    {
        private readonly string ConnectionString;

        public ManufacturingRepository(string connectionString)
        {
            ConnectionString = connectionString;
        }

        public virtual async Task<List<MaintenanceLog>> GetStatusCenterAlertsAsync()
        {
            SqlConnection connection = new SqlConnection(ConnectionString);
            await connection.OpenAsync();

            return (await connection.QueryAsync<MaintenanceLog>("SELECT ID_UnitInfo as ID, SerialNum as SerialNumber, NoteText, DateRecorded, RecordedByUserName FROM MESNotes WHERE StatusId=2").ConfigureAwait(false)).ToList();
        }

    }
}