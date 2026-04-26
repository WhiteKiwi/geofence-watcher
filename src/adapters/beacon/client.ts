import type { BeaconTrackedEntityValue } from "../../domain/index.js";
import {
  BeaconLatestLocation,
  BeaconLatestLocationResponse,
} from "./types.js";

export async function fetchLatestBeaconLocation(
  beacon: BeaconTrackedEntityValue,
): Promise<BeaconLatestLocation> {
  const url = resolveBeaconLatestLocationUrl(beacon.apiUrl, beacon.id);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${beacon.apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Beacon request failed: ${response.status} ${response.statusText}`);
  }

  const parsed = await response.json();
  const location = BeaconLatestLocationResponse.parse(parsed);

  return BeaconLatestLocation.parse({
    id: location.id,
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    observedAt: location.timestamp,
  });
}

export function resolveBeaconLatestLocationUrl(
  apiUrl: string,
  beaconId: string,
): string {
  if (apiUrl.includes("{id}")) {
    return apiUrl.replaceAll("{id}", beaconId);
  }

  if (apiUrl.includes(":id")) {
    return apiUrl.replaceAll(":id", beaconId);
  }

  try {
    const url = new URL(apiUrl);

    if (
      url.pathname.endsWith("/latest") ||
      url.pathname.includes(`/locations/${beaconId}/latest`)
    ) {
      return url.toString();
    }

    const basePath = url.pathname.endsWith("/")
      ? url.pathname
      : `${url.pathname}/`;

    return new URL(`locations/${beaconId}/latest`, `${url.origin}${basePath}`).toString();
  } catch {
    return apiUrl;
  }
}
