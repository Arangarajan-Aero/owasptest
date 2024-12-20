using Dapper.Contrib.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StatusCenterDataLayer.Models
{
    [Table("vwMfgPartNotesForSystemStatusCenter")]
    public class MaintenanceLog
    {
        [ExplicitKey] public int Id { get; set; }
        public string SerialNumber { get; set; } = "";
        public string NoteText { get; set; } = "";
        public DateTime DateRecorded { get; set; }
        public string RecordedByUserName { get; set; } = "";
    }
}
