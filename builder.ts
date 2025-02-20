import fs from "fs";
import { mixColors } from "mix-colors-palette";
import Handlebars from "handlebars";

const rgbToHex = (r?: number, g?: number, b?: number): string => {
  if (r === undefined || g === undefined || b === undefined) {
    throw new Error("All three color components (r, g, b) must be defined.");
  }
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const handlebarsIsLight = (
  lightCol: string,
  darkCol: string,
  context: any
): string => {
  return darkCol;
};

const handlebarsOpacity = (color: string, opacity: number, context: any) => {
  const base = context.data.root.base;
  // console.log("handlebarsOpacity", base, color, opacity, context);
  const result = mixColors([color, base], opacity);
  // console.log("handlebarsOpacity:result", result);
  const hexResult = rgbToHex(result.r, result.g, result.b);
  return hexResult.replace(/#/, "");
};

const handlebarsMix = (
  color1: string,
  color2: string,
  amount: number
): string => {
  const result = mixColors([color1, color2], amount);
  // console.log("handlebarsMix:result", result);
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

Handlebars.registerHelper("isLight", handlebarsIsLight);
Handlebars.registerHelper("opacity", handlebarsOpacity);
Handlebars.registerHelper("mix", handlebarsMix);
Handlebars.registerHelper("opacityWithHex", handlebarsOpacityWithHex);
Handlebars.registerHelper("mixWithHex", handlebarsMixWithHex);

interface Metadata {
  name: string;
  editorScheme: string;
  isLight: boolean;
  italics: boolean;
  parent_scheme: string;
}

(function () {
  try {
    const config: {
      metadata: Metadata;
      themeJson: string;
      themeTemplateXml: string;
      resultXml: string;
    }[] = [
      {
        metadata: {
          name: "1986-theme",
          editorScheme: "/1986.theme.xml",
          isLight: false,
          italics: false,
          parent_scheme: "Darcula",
        },
        themeTemplateXml: "./resources/theme/templates/theme-template.xml",
        themeJson: "./resources/theme/theme1986.theme.json",
        resultXml: "./resources/theme/theme1986.theme.xml",
      },
      {
        metadata: {
          name: "1986-pesito-theme",
          editorScheme: "/1986-pesito.theme.xml",
          isLight: false,
          italics: false,
          parent_scheme: "Darcula",
        },
        themeTemplateXml: "./resources/theme/templates/theme-template.xml",
        themeJson: "./resources/theme/theme1986-pesito.theme.json",
        resultXml: "./resources/theme/theme1986-pesito.theme.xml",
      },
    ];
    config.forEach((cfg) => {
      const meta = cfg.metadata;

      let templateJson = fs.readFileSync(cfg.themeJson, "utf8");
      const colors = JSON.parse(templateJson).colors;
      const templateXml = fs.readFileSync(cfg.themeTemplateXml, "utf8");

      const mappedColorsNoHex = Object.fromEntries(
        Object.entries(colors).map(([key, value]) => [
          key,
          (value as string).replace(/#/g, ""),
        ])
      );

      const outputXml = Handlebars.compile(templateXml)({
        ...meta,
        ...mappedColorsNoHex,
      });

      const missingColors = [
        ...new Set(
          [...outputXml.matchAll(/\{\{(.*?)\}\}/g)].map((match) => match[1])
        ),
      ].filter((match) => !colors.hasOwnProperty(match));
      if (missingColors.length > 0) {
        console.log("missing:", missingColors);
        return;
      }

      fs.writeFileSync(cfg.resultXml, outputXml, "utf8");
    });

    console.log("OK!");
  } catch (err) {
    console.error(err);
  }
})();
