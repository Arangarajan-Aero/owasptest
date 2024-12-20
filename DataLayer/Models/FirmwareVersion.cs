using Dapper.Contrib.Extensions;
using System.Data;
using System.Reflection;

namespace StatusCenterDataLayer.Models
{
    public class FirmwareVersion
    {
        [ExplicitKey] public int Id { get; set; }
        
        /// <summary>
        /// By convention Name is the same as the PI datapoint tagname it's related to
        /// </summary>
        public string Name { get; set; } = "";
        public string Value { get; set; } = "";
        public string Notes { get; set; } = "";

        //[Write(false)] public virtual Instance Instance { get; set; } = null!;
    }
}
