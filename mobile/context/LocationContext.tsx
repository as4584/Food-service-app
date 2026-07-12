import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";

export interface UserCoords {
  latitude: number;
  longitude: number;
}

interface LocationValue {
  coords: UserCoords | null;
  ready: boolean; // permission flow has settled (granted or not)
}

const LocationContext = createContext<LocationValue>({ coords: null, ready: false });

/**
 * Requests foreground location once on mount and shares the coordinates
 * app-wide. Denial/unavailability is silent — consumers just fall back to the
 * default ordering when `coords` is null.
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      } catch {
        // ignore — fall back to default order
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ coords, ready }), [coords, ready]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useUserLocation = () => useContext(LocationContext);
