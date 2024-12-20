using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace StatusCenterDataLayer.Repositories
{
    public class PIAccessRepository : IPIAccessRepository
    {
        private const string PIAccessBaseUrl = "https://piaccess.essinc.com/";

        public async Task<string> GetHomepagePIAccessDataAsync(List<string> units)
        {
            var result = new JArray();

            using (var client = new HttpClient(new HttpClientHandler { UseDefaultCredentials = true }))
            {
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var tasks = new List<Task<JObject?>>();

                foreach (var unit in units)
                {
                    var task = GetUnitDataAsync(client, unit).ContinueWith(async x => await DoWorkOnResponse(x.Result, unit), TaskContinuationOptions.OnlyOnRanToCompletion).Unwrap();
                    tasks.Add(task);
                }

                var responses = await Task.WhenAll(tasks);

                foreach (var response in responses)
                {
                    if (response != null)
                    {
                        result.Add(response);
                    }
                }
            }

            return result.ToString();
        }

        protected static async Task<HttpResponseMessage> GetUnitDataAsync(HttpClient client, string unitName)
        {
            var url = $"{PIAccessBaseUrl}api/getValues?unitName={unitName}&type=&category=StatusCenter";

            return await client.GetAsync(url);
        }

        protected static async Task<JObject?> DoWorkOnResponse(HttpResponseMessage response, string unitName)
        {
            var responseStr = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrEmpty(responseStr) || !response.IsSuccessStatusCode)
            {
                return null;
            }

            var unit = new JObject(); //using JObject because the data that returns for attribute category StatusCenter could be different per machine
            unit["name"] = unitName;
            var responseJson = JToken.Parse(responseStr);
            int i = 0;
            foreach (var item in responseJson.ToList())
            {
                string name = item["name"]?.ToString() ?? ("unknown" + i);
                unit[name] = item["value"];
                i++;
            }

            return unit;
        }


        public async Task<string> GetUnitDataForLoadTimeValueExport(string unitName, DateTime? dateTime = null)
        {
            if (string.IsNullOrEmpty(unitName))
            {
                return "Invalid UnitName";
            }

            string url = $"{PIAccessBaseUrl}api/getValues?unitName={unitName}&type=&category=ControllerLoadTimeValues&time={dateTime}";

            using var client = new HttpClient(new HttpClientHandler { UseDefaultCredentials = true });

            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await client.GetAsync(url);
            if (response == null)
            {
                return "Unable to connect to PIAccess";
            }

            return await response.Content.ReadAsStringAsync();
        }
    }
}
