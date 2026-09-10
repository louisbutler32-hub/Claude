import React from "react";
import { BoardThumb, ShadowThumb, type ThumbConfig } from "../guess/Thumbnail";
import { numberSubject } from "./subject";

const config: ThumbConfig = {
  subject: numberSubject,
  noun: "NUMBER!",
  heroes: [
    { id: "3", x: 430, scale: 2.7 },
    { id: "7", x: 960, scale: 2.7 },
    { id: "10", x: 1500, scale: 3.0 },
  ],
  boardLine: "CAN YOU COUNT TO 12?",
};

export const NumberThumbA: React.FC = () => <ShadowThumb config={config} />;
export const NumberThumbB: React.FC = () => <BoardThumb config={config} />;
