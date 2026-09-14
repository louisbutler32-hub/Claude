import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { vehicleSubject } from "./subject";

const config: ThumbConfig = {
  subject: vehicleSubject,
  noun: "VEHICLE!",
  heroes: [
    { id: "car", x: 430, scale: 2.0 },
    { id: "fireEngine", x: 960, scale: 1.9 },
    { id: "airplane", x: 1500, scale: 1.9 },
  ],
  boardLine: "CAN YOU NAME ALL 12?",
};

export const VehicleThumbA: React.FC = () => <ShadowThumb config={config} />;
export const VehicleThumbB: React.FC = () => <BoardThumb config={config} />;
