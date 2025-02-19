import fs from "fs";
import { mixColors } from "mix-colors-palette";
import Handlebars from "handlebars";

const rgbToHex = (r?: number, g?: number, b?: number): string => {
  if (r === undefined || g === undefined || b === undefined) {
    throw new Error("All three color components (r, g, b) must be defined.");
  }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const handlebarsIsLatte = (
  lightCol: string,
  darkCol: string,
  context: any
): string => {
  return darkCol;
};

const handlebarsOpacity = (color: string, opacity: number, context: any) => {
  const base = context.data.root.base;
  const result = mixColors([color, base], opacity);
  const hexResult = rgbToHex(result.r, result.g, result.b);
  return hexResult.replace(/#/, "");
};

const handlebarsMix = (
  color1: string,
  color2: string,
  amount: number
): string => {
  const result = mixColors([color1, color2], amount);
  const hexResult = rgbToHex(result.r, result.g, result.b);
  return hexResult.replace(/#/, "");
};

const handlebarsOpacityWithHex = (
  color: string,
  opacity: number,
  context: any
) => {
  const result = mixColors([color], opacity);
  return result;
};

const handlebarsMixWithHex = (
  color1: string,
  color2: string,
  amount: number
): string => {
  const result = mixColors([color1, color2], amount);
  return result;
};

Handlebars.registerHelper("isLatte", handlebarsIsLatte);
Handlebars.registerHelper("opacity", handlebarsOpacity);
Handlebars.registerHelper("mix", handlebarsMix);
Handlebars.registerHelper("opacityWithHex", handlebarsOpacityWithHex);
Handlebars.registerHelper("mixWithHex", handlebarsMixWithHex);

(function () {
  try {
    const dataColors = fs.readFileSync("./resources/theme/colors.json", "utf8");
    const colors: { [key: string]: string } = JSON.parse(dataColors);

    const templateJson = fs.readFileSync(
      "./resources/theme/templates/theme-template.json",
      "utf8"
    );
    const templateXml = fs.readFileSync(
      "./resources/theme/templates/theme-template.xml",
      "utf8"
    );

    const mappedColors = Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [key, value])
    );
    const mappedColorsNoHex = Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [
        key,
        value.replace(/#/g, ""),
      ])
    );

    const options = {
      name: "1986-theme",
      editorScheme: "/theme-1986.xml",
      isLatte: false,
      italics: false,
      parent_scheme: "Darcula",
    };

    const outputJson = Handlebars.compile(templateJson)({
      ...options,
      ...mappedColors,
    });
    // console.log(mappedColorsNoHex);
    const outputXml = Handlebars.compile(templateXml)({
      ...options,
      ...mappedColorsNoHex,
    });

    const missingColors = [
      ...new Set(
        [...outputXml.matchAll(/\{\{(.*?)\}\}/g)].map((match) => match[1])
      ),
    ].filter((match) => !colors.hasOwnProperty(match));
    if (missingColors.length > 0) {
      console.log("Missing colors:", missingColors);
      return;
    }

    fs.writeFileSync(
      "./resources/theme/jetbrains1986theme.theme.json",
      outputJson,
      "utf8"
    );

    fs.writeFileSync("./resources/theme/theme-1986.xml", outputXml, "utf8");
    console.log("OK!");
  } catch (err) {
    console.error(err);
  }
})();
