import React from "react";
import { durationFor, GuessVideo } from "../guess/GuessVideo";
import { vehicleSubject } from "./subject";

/** "Chomp Chomp VEHICLES" — the vehicle episode of the guess format. */
export const VehicleVideo: React.FC = () => (
  <GuessVideo subject={vehicleSubject} audio="audio/vehicles-mix.mp3" />
);

export const VEHICLE_DURATION_IN_FRAMES = durationFor(vehicleSubject);
