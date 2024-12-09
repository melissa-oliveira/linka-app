import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import EventCard from "./EventCard";
import { EventList } from "@/models/viewModels/EventList";
import EventSquareCard from "./EventSquareCard";
import EventLocationFetcher from "./EventCoordinatesFetcher";
import { Event } from "../../models/Event";

type Props = {
  cardShape: "square" | "rectangular";
  events: EventList[];
  emptyMessage: string | "Nenhum evento encontrado.";
  onPress: any;
};

export default function EventListComponent(props: Props) {
  const handleLocationFetch = (lat: number, lng: number) => {
    console.log("Latitude:", lat, "Longitude:", lng);
  };
  return (
    <View style={{ flex: 1 }}>
      {props.cardShape === "rectangular" ? (
        props.events && props.events.length > 0 ? (
          props.events.map((event) => (
            <EventCard
              key={event.id}
              eventTitle={event.eventTitle}
              eventStartDateTime={event.eventStartDateTime}
              eventEndDateTime={event.eventEndDateTime}
              eventJobs={event.eventJobs}
              eventFilledJobs={event.eventFilledJobs}
              eventImageUrl={event.eventImageUrl ? event.eventImageUrl : ""}
              eventStatus={event.eventStatus}
              onPress={() => props.onPress(event.id)}
            />
          ))
        ) : (
          <Text
            style={{ textAlign: "center", marginTop: 10, marginBottom: 30 }}
          >
            {props.emptyMessage}
          </Text>
        )
      ) : (
        <View>
          {props.events && props.events.length > 0 ? (
            <FlatList
              data={props.events}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              keyExtractor={(event) => event.id}
              renderItem={({ item: event }) => (
                <View style={styles.cardWrapper}>
                  <EventSquareCard
                    key={event.id}
                    eventTitle={event.eventTitle}
                    eventStartDateTime={event.eventStartDateTime}
                    eventImageUrl={
                      event.eventImageUrl ? event.eventImageUrl : ""
                    }
                    eventStatus={event.eventStatus}
                    onPress={() => props.onPress(event.id)}
                  />
                </View>
              )}
            />
          ) : (
            <Text
              style={{ textAlign: "center", marginTop: 10, marginBottom: 30 }}
            >
              {props.emptyMessage}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    paddingBottom: 10,
  },
  cardWrapper: {
    marginHorizontal: 10,
    marginLeft: 0,
  },
  noEventsText: {
    textAlign: "center",
    marginTop: 20,
  },
});
