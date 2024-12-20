using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StatusCenterDataLayer.Repositories;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceInit
    {
        public static IServiceCollection AddStatusCenterDataLayerServices(this IServiceCollection services, string connectionString, string piServerName, IConfiguration configuration)
        {
            services.TryAddScoped<IPIAccessRepository, PIAccessRepository>();
            services.TryAddScoped<IFirmwareVersionRepository>(x => new FirmwareVersionRepository(connectionString));            

            return services;
        }

        public static IServiceCollection AddMESServices(this IServiceCollection services, string connectionString)
        {
            services.TryAddScoped<IManufacturingRepository>(x => new ManufacturingRepository(connectionString));
            return services;
        }
    }
}
