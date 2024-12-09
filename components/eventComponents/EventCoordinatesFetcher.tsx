import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import { Event } from "../../models/Event";

interface Props {
  eventId: string;
  events: Event[];
  googleApiKey: string;
  onLocationFetch: (latitude: number, longitude: number) => void;
}

const EventLocationFetcher: React.FC<Props> = ({
  eventId,
  events,
  googleApiKey,
  onLocationFetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinates = async (cep: string) => {
    if (!eventId) {
      throw new Error("Event ID is undefined");
    }
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: cep,
            key: googleApiKey,
          },
        }
      );

      const location = response.data.results[0]?.geometry.location;
      if (location) {
        onLocationFetch(location.lat, location.lng);
      } else {
        throw new Error("Localização não encontrada.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar coordenadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      fetchCoordinates(event.address.cep);
    } else {
      setError("Evento não encontrado.");
    }
  }, [eventId, events]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Buscando localização...</Text>
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
    marginTop: 8,
  },
});

export default EventLocationFetcher;
