/*
API docs: https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html
Function expects either:
- a string with a one-line address ("1600 Pennsylvania Ave, Washington, DC"), or
- an object with "street"/"city"/"state"/"zip" keys

If ZIP is provided, city and state are optional.
*/

export async function geocode(address) {
  let searchType = "address";
  let params = {
    format: "jsonp",
    callback: "callback",
    benchmark: "Public_AR_Current"
  };
  if (typeof address == "string") {
    searchType = "onelineaddress";
    params.address = address;
  } else {
    Object.assign(params, address);
  }
  let url = new URL(`https://geocoding.geo.census.gov/geocoder/locations/${searchType}`);
  for (var k in params) {
    url.searchParams.set(k, params[k]);
  }
  let response = await jsonp(url.toString());
  return response?.result?.addressMatches[0];
}

function jsonp(url, callback = "callback") {
  return new Promise((ok, fail) => {
    let iframe = document.createElement("iframe");
    let onmessage = function(e) {
      if (e.source == iframe.contentWindow) {
        iframe.remove();
        window.removeEventListener("message", onmessage);
        if (e.data.response) {
          ok(e.data.response);
        } else {
          fail(e.data.error);
        }
      }
    };
    window.addEventListener("message", onmessage);
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.position = "absolute";
    iframe.style.left = "-1000px";
    iframe.sandbox = "allow-scripts";
    let doc = `
      <script>
        window.${callback} = function(response) {
          let message = { response };
          window.parent.postMessage(message, "${window.location.origin}");
        };
        let script = document.createElement("script");
        let params = new URLSearchParams(window.location.search);
        script.src = "${url}";
        script.onerror = function(err) {
          window.parent.postMessage({ error: "JSONP call returned a server error." }, "${window.location.origin}");
        };
        document.documentElement.append(script);
      </script>
    `;
    iframe.srcdoc = doc;
    document.body.append(iframe);
  });
}