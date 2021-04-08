import fs from 'fs'
import YAML from 'yaml'

function mapify(arr) {
    return arr.reduce(function(res, item) {
        res[item.Id] = item;
        return res;
    }, {});
}

const varSep = ':>';
const file = fs.readFileSync('./spec.yaml', 'utf8');
const system = YAML.parse(file);
//console.log(system);

const config = system.Config;
const boxType = mapify(system.BoxType);
const variable = mapify(system.Variable);
const consBox = system.Box.filter(b => boxType[b.Type].Type === 'constant');
const persBox = system.Box.filter(b => boxType[b.Type].Type === 'persistent');

//console.log(config, boxType, variable, box);

// experiment loop
for(let i = 0; i < config.StepCount; i++) {
    // run constants
    let keep = true;
    while (keep) {
        keep = false;
        consBox.forEach(function (b) {
            const bt = boxType[b.Type];
            const input = {};
            const output = {};
            (b.Input || []).forEach(function (i) {
                input[i.Id] = variable[i.Source].Value;
            });
            eval(bt.Function);
            bt.Output.forEach(function (o) {
                variable[b.Id + varSep + o.Id].Value = output[o.Id];
            })
        });
    }

    // run persistents
    persBox.forEach(function (b) {
        const bt = boxType[b.Type];
        const input = {};
        const output = {};
        (b.Input || []).forEach(function (i) {
            input[i.Id] = variable[i.Source].Value;
        });
        bt.Output.forEach(function (o) {
            output[o.Id] = variable[b.Id + varSep + o.Id].Value;
        })
        eval(bt.Function);
        bt.Output.forEach(function (o) {
            variable[b.Id + varSep + o.Id].Value = output[o.Id];
        })
    });

    console.log(`====`);
    console.log(`iter ${i}`);
    Object.entries(variable).forEach(function ([_, v]) {
        console.log(`${v.Id.padEnd(10)}: ${v.Value}`);
    })
}