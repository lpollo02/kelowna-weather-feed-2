import axios from "axios";
import { parseStringPromise, Builder } from "xml2js";

export default async function handler(req, res) {
  const FEED_URL = "https://weather.gc.ca/rss/weather/49.883_-119.483_e.xml";

  try {
    const { data } = await axios.get(FEED_URL);
    const feed = await parseStringPromise(data);

    feed.feed.$["xmlns:media"] = "http://search.yahoo.com/mrss/";

    const entries = feed.feed.entry || [];
    entries.forEach(entry => {
      const summary = entry.summary?.[0]?.toLowerCase() || "";
      const iconUrl = getIconForSummary(summary);
      entry["media:content"] = [{ $: { url: iconUrl, type: "image/png" } }];
    });

    const builder = new Builder();
    const xml = builder.buildObject(feed);

    res.setHeader("Content-Type", "application/atom+xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Error processing feed:", err.message);
    res.status(500).send("Error fetching or modifying feed");
  }
}

function getIconForSummary(summary) {
  if (summary.includes("sunny")) return "https://weather.gc.ca/weathericons/01.png";
  if (summary.includes("clear")) return "https://weather.gc.ca/weathericons/01.png";
  if (summary.includes("partly")) return "https://weather.gc.ca/weathericons/02.png";
  if (summary.includes("cloudy")) return "https://weather.gc.ca/weathericons/03.png";
  if (summary.includes("rain")) return "https://weather.gc.ca/weathericons/12.png";
  if (summary.includes("showers")) return "https://weather.gc.ca/weathericons/11.png";
  if (summary.includes("snow")) return "https://weather.gc.ca/weathericons/15.png";
  if (summary.includes("flurries")) return "https://weather.gc.ca/weathericons/16.png";
  if (summary.includes("thunder")) return "https://weather.gc.ca/weathericons/17.png";
  if (summary.includes("fog")) return "https://weather.gc.ca/weathericons/45.png";
  return "https://weather.gc.ca/weathericons/00.png";
}
