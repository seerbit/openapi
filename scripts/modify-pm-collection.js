/**
 * Modify PM Collection
 * + adds variables
 * + variables' values read from openAPI spec yaml file
 * 
 * Specify optionally:
 *   -i PM Collection to be modified
 *   -a openAPI spec yaml file
 *   -o PM Collection output file
 */

fs = require("fs");
const YAML = require("yaml");
const argv = require("minimist")(process.argv.slice(2));

const pmInputFile = argv.i ? argv.i : "output/xternalApi.json";
const pmOutputFile = argv.o ? argv.o : "output/external-api-collection.json";
const apiSpecFile = argv.a ? argv.a : "api-spec/external-api.yml";

const apiSpec = YAML.parse(fs.readFileSync(apiSpecFile).toString());

console.log("Reading auths from examples in " + apiSpecFile);

var specToken, specPK;
try {
  specPK = apiSpec.components.schemas.CaptureRequest.example.publicKey;
  specToken =
    apiSpec.components.schemas.GenerateEncryptedSecretKeyResponse.example.data
      .EncrytedSecKey.encryptedKey;
} catch (err) {
  throw err;
}

console.log("Token: " + specToken);
console.log("Username (Public Key): " + specPK);

console.log("Reading converted PM Collection " + pmInputFile)
var convertedPMC = JSON.parse(fs.readFileSync(pmInputFile).toString());

convertedPMC.variable = [
  ...convertedPMC.variable,
  {
    id: "ff2d1cba-e93b-4f04-b19f-6f1d41dcd350",
    key: "token",
    value: specToken,
  },
  {
    id: "ff9081fb-e840-4a46-8cdc-78175b921ef7",
    key: "Username",
    value: specPK,
  },
  {
    id: "ff182d01-09ed-4e1e-b419-77a5ec085c0f",
    key: "Password",
    value: "SBTESTSECK_QNWbm0JkcdLYDzz2CQnA4ctys4EWG1YhljIzOvjs",
  },
];

console.log("Writing modified PM Collection to " + pmOutputFile);
fs.writeFile(pmOutputFile, JSON.stringify(convertedPMC, null, 2), (err) => {
  if (err) throw err;
});
