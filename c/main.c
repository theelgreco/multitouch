#include <math.h>
#include <unistd.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <CoreFoundation/CoreFoundation.h>

typedef struct { float x,y; } mtPoint;
typedef struct { mtPoint pos,vel; } mtReadout;

typedef struct {
  int frame;
  double timestamp;
  int identifier, state, foo3, foo4;
  mtReadout normalized;
  float size;
  int zero1;
  float angle, majorAxis, minorAxis; // ellipsoid
  mtReadout mm;
  int zero2[2];
  float unk2;
} Finger;

typedef void *MTDeviceRef;
typedef int (*MTContactCallbackFunction)(int,Finger*,int,double,int);

MTDeviceRef MTDeviceCreateDefault();
void MTRegisterContactFrameCallback(MTDeviceRef, MTContactCallbackFunction);
void MTDeviceStart(MTDeviceRef, int);

static int chrome_out_fd = -1;

void send_json_to_chrome_fd(const char *json) {
    uint32_t len = (uint32_t)strlen(json);
    // write length (little-endian) then json bytes
    write(chrome_out_fd, &len, 4);
    write(chrome_out_fd, json, len);
    fsync(chrome_out_fd); // optional, ensures delivery
}

int callback(int device, Finger *data, int nFingers, double timestamp, int frame) {
    char json[1024];
    int offset = 0;

    offset += snprintf(
      json + offset, 
      sizeof(json), "{\"frame\":%d,\"timestamp\":%.6f,\"fingers\":[", 
      frame, 
      timestamp
    );

    for (int i = 0; i < nFingers; i++) {
        Finger *f = &data[i];

        // offset += snprintf(
        //   json + offset, sizeof(json) - offset, 
        //   "{\"id\":%d,\"x\":%.3f,\"y\":%.3f}", 
        //   f->identifier,
        //   f->normalized.pos.x,
        //   f->normalized.pos.y
        // );

                // convert radians to degrees
        float angle_deg = f->angle * 90 / atan2(1, 0);

        offset += snprintf(json + offset, sizeof(json) - offset,
            "{"
            "\"frame\":%d,"
            "\"angle\":%.2f,"
            "\"majorAxis\":%.3f,"
            "\"minorAxis\":%.3f,"
            "\"position\":{\"x\":%.3f,\"y\":%.3f},"
            "\"velocity\":{\"x\":%.3f,\"y\":%.3f},"
            "\"identifier\":%d,"
            "\"state\":%d,"
            "\"foo3\":%d,"
            "\"foo4\":%d,"
            "\"size\":%.3f,"
            "\"unk2\":%.3f"
            "}",
            f->frame,
            angle_deg,
            f->majorAxis,
            f->minorAxis,
            f->normalized.pos.x,
            f->normalized.pos.y,
            f->normalized.vel.x,
            f->normalized.vel.y,
            f->identifier,
            f->state,
            f->foo3,
            f->foo4,
            f->size,
            f->unk2
        );

        if (i < nFingers - 1) offset += snprintf(json + offset, sizeof(json) - offset, ",");
        if (offset >= (int)sizeof(json) - 64) break; // prevent overflow
    }

    offset += snprintf(
      json + offset, 
      sizeof(json) - offset, 
      "]}"
    );

    send_json_to_chrome_fd(json);
    
    return 0;
}

int main() {
  // 1) duplicate original stdout FD so we can still write to it after redirect
  chrome_out_fd = dup(STDOUT_FILENO);
  if (chrome_out_fd < 0) return 1;

  // 2) redirect stdout and stderr to /dev/null so MTDevice prints are dropped
  int devnull = open("/dev/null", O_WRONLY);
  if (devnull >= 0) {
      dup2(devnull, STDOUT_FILENO);
      dup2(devnull, STDERR_FILENO);
      if (devnull != STDOUT_FILENO && devnull != STDERR_FILENO) close(devnull);
  }
  
  send_json_to_chrome_fd("{\"status\":\"ok\",\"note\":\"stream frame\"}");

  setvbuf(stdout, NULL, _IONBF, 0);
  MTDeviceRef dev = MTDeviceCreateDefault();
  MTRegisterContactFrameCallback(dev, callback);
  MTDeviceStart(dev, 0);

  sleep(-1);
  
  return 0;
}
