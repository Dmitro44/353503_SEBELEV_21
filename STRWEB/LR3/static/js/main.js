// static/js/main.js
import { Slider } from "./slider.js";
import "./theme_switcher.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Main JS script loaded as module");

    // Initialize all sliders on the page
    const sliders = document.querySelectorAll(".slider");
    sliders.forEach((sliderElement) => new Slider(sliderElement));
});

