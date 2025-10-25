#include <math.h>
#include <unistd.h>
#include <stdio.h>
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
void MTDeviceStart(MTDeviceRef, int); // thanks comex


int callback(int device, Finger *data, int nFingers, double timestamp, int frame) {
  FILE *file = fopen("../results.json", "w");
  if (file == NULL) {
    printf("Error: Could not open results.json for writing\n");
    return -1;
  }

  fprintf(file, "[\n");
  
  for (int i = 0; i < nFingers; i++) {
    Finger *f = &data[i];
    
    fprintf(file, "  {\n");
    fprintf(file, "    \"frame\": %d,\n", f->frame);
    fprintf(file, "    \"timestamp\": %.6f,\n", timestamp);
    fprintf(file, "    \"identifier\": %d,\n", f->identifier);
    fprintf(file, "    \"state\": %d,\n", f->state);
    fprintf(file, "    \"angle\": %.2f,\n", f->angle * 90 / atan2(1,0));
    fprintf(file, "    \"majorAxis\": %.3f,\n", f->majorAxis);
    fprintf(file, "    \"minorAxis\": %.3f,\n", f->minorAxis);
    fprintf(file, "    \"position\": {\n");
    fprintf(file, "      \"x\": %.3f,\n", f->normalized.pos.x);
    fprintf(file, "      \"y\": %.3f\n", f->normalized.pos.y);
    fprintf(file, "    },\n");
    fprintf(file, "    \"velocity\": {\n");
    fprintf(file, "      \"x\": %.3f,\n", f->normalized.vel.x);
    fprintf(file, "      \"y\": %.3f\n", f->normalized.vel.y);
    fprintf(file, "    },\n");
    fprintf(file, "    \"size\": %.3f,\n", f->size);
    fprintf(file, "    \"foo3\": %d,\n", f->foo3);
    fprintf(file, "    \"foo4\": %d,\n", f->foo4);
    fprintf(file, "    \"unk2\": %.3f\n", f->unk2);
    
    if (i < nFingers - 1) {
      fprintf(file, "  },\n");
    } else {
      fprintf(file, "  }\n");
    }
  }
  
  fprintf(file, "]\n");
  fclose(file);
  
  printf("Written %d finger(s) to results.json\n", nFingers);
  return 0;
}

int main() {
  MTDeviceRef dev = MTDeviceCreateDefault();
  MTRegisterContactFrameCallback(dev, callback);
  MTDeviceStart(dev, 0);
  printf("Ctrl-C to abort\n");
  sleep(-1);
  return 0;
}
