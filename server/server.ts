import { watch } from "fs";
import path from "path";

const jsonPath = path.join("..", "results.json");

watch(jsonPath, null, (event, filename) => {
    if (event === "change") {
    }
});
