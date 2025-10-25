#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>

// Send one JSON message to Chrome
void send_json(const char *json) {
    uint32_t len = (uint32_t)strlen(json);
    fwrite(&len, 4, 1, stdout);   // length prefix
    fwrite(json, len, 1, stdout); // JSON body
    fflush(stdout);
}

int main() {
    for (;;) {
        send_json("{\"status\":\"ok\",\"note\":\"stream frame\"}");
        usleep(500000); // 0.5 seconds
    }
    return 0;
}