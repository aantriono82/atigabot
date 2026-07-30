export interface PrayerTimes {
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
  imsak: string;
  midnight: string;
}

interface AladhanResponse {
  data: {
    timings: Record<string, string>;
    date: { readable: string };
  };
}

export async function getPrayerTimesByAddress(
  address: string,
): Promise<PrayerTimes> {
  const url = new URL("https://api.aladhan.com/v1/timingsByAddress");
  url.searchParams.set("address", address);
  url.searchParams.set("method", "4");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Aladhan API error: ${res.status}`);
  }
  const data = (await res.json()) as AladhanResponse;
  const t = data.data.timings;
  return {
    date: data.data.date.readable,
    fajr: t.Fajr ?? "",
    sunrise: t.Sunrise ?? "",
    dhuhr: t.Dhuhr ?? "",
    asr: t.Asr ?? "",
    sunset: t.Sunset ?? "",
    maghrib: t.Maghrib ?? "",
    isha: t.Isha ?? "",
    imsak: t.Imsak ?? "",
    midnight: t.Midnight ?? "",
  };
}
