using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StatusCenter.Mvc;
using StatusCenter.Services;
using ESS.Identity;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
//builder.Logging.

services.Configure<RazorViewEngineOptions>(option =>
{
    option.ViewLocationExpanders.Add(new FeatureViewLocationExpander());

});

var DefaultSqlConnectionString = builder.Configuration.GetValue<string>("ConnectionStrings:DefaultSQL");
var ConfigManagerSqlConnectionString = builder.Configuration.GetValue<string>("ConnectionStrings:ConfigManagerSQL");
var piServerName = builder.Configuration.GetValue<string>("PIConfiguration:PIServerName");
var piDatabaseName = builder.Configuration.GetValue<string>("PIConfiguration:PIDatabaseName");

services.AddHttpContextAccessor();

// Add services to the container
services
    .AddConfigManagerDataLayerServices("sql", ConfigManagerSqlConnectionString)
    .AddMESServices(DefaultSqlConnectionString)
    .AddStatusCenterDataLayerServices(DefaultSqlConnectionString, piServerName, builder.Configuration)
    .AddRazorPages()
    .AddRazorRuntimeCompilation();

services.TryAddScoped<ICachedObjects, CachedObjects>(); //"cached" to the scope. Not very cached

services.AddAuthentication(NegotiateDefaults.AuthenticationScheme).AddNegotiate();

services.AddControllersWithViews().AddNewtonsoftJson();
var mvcBuilder = services.AddControllersWithViews();

mvcBuilder.AddFeatureFolders();
mvcBuilder.AddControllersAsServices();

builder.WebHost.UseIIS();

var app = builder.Build();
//app.UsePathBase(builder.Configuration.GetSection("RoutePrefix").Value);

//app.UseStatusCodePages();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();

//new StaticFileOptions()
//{
//    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "TempFiles")),
//    RequestPath = "/TempFiles"
//}

app.UseRouting(); //anything after this can utilize routing

app.UseAuthentication();
app.UseAuthorization();
app.BlockGroupAccess("BlockInternalSites");
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapControllerRoute(name: "detail", pattern: "{controller}/{action=Index}/{id?}");
    endpoints.MapControllerRoute(name: "DefaultIndex", pattern: "{controller}", new { action = "Index" });
    endpoints.MapControllerRoute(name: "DefaultHome", pattern: "{controller=Home}/{action=Index}");
    endpoints.MapControllerRoute(name: "404-PageNotFound", pattern: "{*url}", new { controller = "Error", action = "FourOFour" });
});

app.Run();
