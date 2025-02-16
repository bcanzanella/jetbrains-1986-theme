const fs = require("fs");

const path = "./resources/theme/jetbrains1986theme.theme.json";

try {
  const dataColors = fs.readFileSync(path, "utf8");
  const colors = JSON.parse(dataColors, null, 4).colors;

  const templateFileContent = fs.readFileSync(
    "./resources/theme/theme-1986-template.xml",
    "utf8"
  );

  const regex = /\{\{(.*?)\}\}/g;

  const matches = new Set(
    [...templateFileContent.matchAll(regex)].map((match) => match[1])
  );

  const missingColors = [...matches].filter(
    (match) => !colors.hasOwnProperty(match)
  );

  if (missingColors.length > 0) {
    console.log("Missing colors:", missingColors);
    return;
  }

  let updatedTemplate = templateFileContent.replace(regex, (match, p1) => {
    return (colors[p1] || match || "").replace(/#/, "");
  });

  fs.writeFileSync("./resources/theme/theme-1986.xml", updatedTemplate, "utf8");
  console.log("OK!");
} catch (err) {
  console.error(err);
}
