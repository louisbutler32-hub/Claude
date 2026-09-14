import React from "react";
import { ANIMAL_ART } from "../animals/animals";
import { DINO_ART } from "../dinosaurs/dinosaurs";
import type { DrifterId } from "../guess/critters";
import type { GuessArt } from "../guess/types";
import { SEA_ART } from "../sea/sea";
import { VEGGIE_ART } from "../veggies/veggies";
import { VEHICLE_ART } from "../vehicles/vehicles";
import { BlackCatArt, RainbowArt } from "./extras";

/**
 * The twelve colours. Every hero and every "friend" is borrowed from a
 * cast member already drawn for another episode — the point of the
 * episode is "this colour turns up everywhere on the channel", so pulling
 * from all six casts is the content, not a shortcut.
 */

export type Friend = { Art: GuessArt; label: string };

export type ColourDef = {
  id: string;
  /** the word that pops up on the reveal, and the board's label */
  name: string;
  hex: string;
  shade: string;
  Hero: GuessArt;
  /** the object's own name, said in the audio but never shown on screen —
   *  the reveal is the colour, not the object */
  heroLabel: string;
  friends: Friend[];
  drifter: DrifterId;
  slotScale: number;
  heroScale: number;
};

export const COLOURS: ColourDef[] = [
  {
    id: "red",
    name: "Red",
    hex: "#ea5b52",
    shade: "#c23f38",
    Hero: VEGGIE_ART.tomato,
    heroLabel: "Tomato",
    friends: [
      { Art: VEHICLE_ART.fireEngine, label: "Fire Engine" },
      { Art: DINO_ART.allosaurus, label: "Allosaurus" },
    ],
    drifter: "bee",
    slotScale: 1.05,
    heroScale: 2.5,
  },
  {
    id: "orange",
    name: "Orange",
    hex: "#ef8a3c",
    shade: "#c96a22",
    Hero: VEGGIE_ART.carrot,
    heroLabel: "Carrot",
    friends: [
      { Art: ANIMAL_ART.lion, label: "Lion" },
      { Art: SEA_ART.clownfish, label: "Clownfish" },
    ],
    drifter: "airplane",
    slotScale: 1.0,
    heroScale: 2.3,
  },
  {
    id: "yellow",
    name: "Yellow",
    hex: "#f3c93f",
    shade: "#cfa423",
    Hero: VEGGIE_ART.corn,
    heroLabel: "Corn",
    friends: [
      { Art: VEHICLE_ART.bus, label: "Bus" },
      { Art: ANIMAL_ART.duck, label: "Duck" },
    ],
    drifter: "butterfly",
    slotScale: 0.92,
    heroScale: 2.25,
  },
  {
    id: "green",
    name: "Green",
    hex: "#4a9450",
    shade: "#357038",
    Hero: VEGGIE_ART.broccoli,
    heroLabel: "Broccoli",
    friends: [
      { Art: ANIMAL_ART.frog, label: "Frog" },
      { Art: DINO_ART.brachiosaurus, label: "Brachiosaurus" },
    ],
    drifter: "kite",
    slotScale: 1.0,
    heroScale: 2.45,
  },
  {
    id: "blue",
    name: "Blue",
    hex: "#3f83bd",
    shade: "#2d6699",
    Hero: SEA_ART.whale,
    heroLabel: "Whale",
    friends: [
      { Art: VEHICLE_ART.train, label: "Train" },
      { Art: DINO_ART.stegosaurus, label: "Stegosaurus" },
    ],
    drifter: "ladybug",
    slotScale: 0.9,
    heroScale: 2.1,
  },
  {
    id: "purple",
    name: "Purple",
    hex: "#8b58b3",
    shade: "#6b3d92",
    Hero: VEGGIE_ART.eggplant,
    heroLabel: "Eggplant",
    friends: [
      { Art: SEA_ART.squid, label: "Squid" },
      { Art: DINO_ART.pterodactyl, label: "Pterodactyl" },
    ],
    drifter: "snail",
    slotScale: 0.92,
    heroScale: 2.1,
  },
  {
    id: "pink",
    name: "Pink",
    hex: "#e07f9c",
    shade: "#bb5c78",
    Hero: ANIMAL_ART.pig,
    heroLabel: "Pig",
    friends: [
      { Art: SEA_ART.octopus, label: "Octopus" },
      { Art: DINO_ART.parasaurolophus, label: "Parasaurolophus" },
    ],
    drifter: "bee",
    slotScale: 0.92,
    heroScale: 2.45,
  },
  {
    id: "brown",
    name: "Brown",
    hex: "#a3794a",
    shade: "#7a5a34",
    Hero: VEGGIE_ART.potato,
    heroLabel: "Potato",
    friends: [
      { Art: ANIMAL_ART.dog, label: "Dog" },
      { Art: VEGGIE_ART.mushroom, label: "Mushroom" },
    ],
    drifter: "crab",
    slotScale: 0.97,
    heroScale: 2.4,
  },
  {
    id: "black",
    name: "Black",
    hex: "#2c2c2c",
    shade: "#000000",
    Hero: ANIMAL_ART.penguin,
    heroLabel: "Penguin",
    friends: [{ Art: BlackCatArt, label: "Cat" }],
    drifter: "bunny",
    slotScale: 0.9,
    heroScale: 2.3,
  },
  {
    id: "white",
    name: "White",
    hex: "#f4f2ea",
    shade: "#c9c2ac",
    Hero: ANIMAL_ART.sheep,
    heroLabel: "Sheep",
    friends: [{ Art: VEHICLE_ART.boat, label: "Boat" }],
    drifter: "dino",
    slotScale: 0.92,
    heroScale: 2.45,
  },
  {
    id: "grey",
    name: "Grey",
    hex: "#9aa6ad",
    shade: "#7a868d",
    Hero: ANIMAL_ART.elephant,
    heroLabel: "Elephant",
    friends: [
      { Art: SEA_ART.shark, label: "Shark" },
      { Art: VEHICLE_ART.policeCar, label: "Police Car" },
    ],
    drifter: "butterfly",
    slotScale: 0.86,
    heroScale: 2.2,
  },
  {
    id: "rainbow",
    name: "Rainbow",
    hex: "#e07f9c",
    shade: "#8b58b3",
    Hero: RainbowArt,
    heroLabel: "Rainbow",
    friends: [],
    drifter: "kite",
    slotScale: 0.9,
    heroScale: 2.15,
  },
];

export const COLOUR_ART: Record<string, GuessArt> = Object.fromEntries(
  COLOURS.map((c) => [c.id, c.Hero])
);
export const COLOUR_NAME: Record<string, string> = Object.fromEntries(
  COLOURS.map((c) => [c.id, c.name])
);
