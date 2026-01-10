import StyleDictionary from "style-dictionary";

const sd = new StyleDictionary({
  source: ["tokens/*.json"],
  log: {
    verbosity: "verbose",
  },
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "tokens/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
        },
      ],
    },
  },
});

async function build() {
  try {
    await sd.buildAllPlatforms();
    console.log("✅ Token build successfully");
  } catch (error) {
    console.error("❌ Error building tokens:");

    console.log(error);
    process.exit(1);
  }
}

build();
