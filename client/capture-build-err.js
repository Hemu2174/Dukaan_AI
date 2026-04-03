import { build } from 'vite';

async function runBuild() {
  try {
    await build();
    console.log("Build complete");
  } catch (e) {
    if (e.errors && e.errors.length) {
        console.error("Vite/Rollup Error Details:", JSON.stringify(e.errors, null, 2));
    } else {
        console.error("General Error:", e);
    }
  }
}

runBuild();
