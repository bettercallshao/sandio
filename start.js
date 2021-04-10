import sandio from "./index.js";

// main for tests
import fs from "fs";
import YAML from "yaml";

const file = fs.readFileSync("default.yaml", "utf8");
const system = YAML.parse(file);

const stream = fs.createWriteStream("result.csv");
function monitor(config, value, variable) {
  console.log(`====`);
  console.log(`length    : ${config.Length}`);
  Object.entries(variable).forEach(function ([_, v]) {
    console.log(`${v.Id.padEnd(10)}: ${v.Value} (${v.Iteration})`);
  });
  stream.write(`${config.Length}, ${value['pers1:sx']}\n`);
}

sandio.run(system, monitor);
