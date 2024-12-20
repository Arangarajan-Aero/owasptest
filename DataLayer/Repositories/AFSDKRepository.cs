
//using System.Data;
//using OSIsoft.AF;

//namespace StatusCenterDataLayer.Repositories
//{
//    public class AFSDKRepository : IAFSDKRepository
//    {

//        private readonly AFDatabase AFDB;

//        public AFSDKRepository(string piServerName, string piDatabaseName)
//        {
//            PISystems systems = new PISystems();
//            if (systems.Contains(piServerName))
//            {
//                if (systems[piServerName].Databases.Contains(piDatabaseName))
//                {
//                    AFDB = systems[piServerName].Databases[piDatabaseName];                     
//                }
//                else
//                {
//                    throw new Exception("Could not find PI Database: " + piDatabaseName);
//                }
//            }
//            else
//            {
//                throw new Exception("Could not find PI Server: " + piServerName);
//            }
//        }

//        public virtual async Task GetUnitControllerInfo()
//        {
//            foreach (var item in AFDB.Elements)
//            {
//                //item.Attributes
//            }
//        }

//    }
//}