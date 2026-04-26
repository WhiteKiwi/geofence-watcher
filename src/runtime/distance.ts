import type { Coordinates } from "../domain/index.js";

const EARTH_RADIUS_METERS = 6_371_000;

export function distanceMeters(
  left: Coordinates,
  right: Coordinates,
): number {
  const latitudeRadiansA = toRadians(left.latitude);
  const latitudeRadiansB = toRadians(right.latitude);
  const deltaLatitude = toRadians(right.latitude - left.latitude);
  const deltaLongitude = toRadians(right.longitude - left.longitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeRadiansA) *
      Math.cos(latitudeRadiansB) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
