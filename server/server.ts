import { watch } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const jsonPath = path.join("..", "results.json");

async function handleChange() {
    const contents = await readFile(jsonPath, "utf-8");

    try {
        const jsonContents = JSON.parse(contents);
        console.log(jsonContents);
    } catch (err) {}
}

watch(jsonPath, null, (event, filename) => {
    if (event === "change") {
        handleChange();
    }
});
