#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <libevdev-1.0/libevdev/libevdev.h>

// Global state for signal handler access
static volatile sig_atomic_t running = 1;
static struct libevdev *g_dev = NULL;
static int g_fd = -1;

void cleanup(void) {
    if (g_dev) {
        libevdev_free(g_dev);
        g_dev = NULL;
    }
    if (g_fd >= 0) {
        close(g_fd);
        g_fd = -1;
    }
}

void signal_handler(int sig) {
    (void)sig;  // unused
    running = 0;
}

void setup_signal_handlers(void) {
    struct sigaction sa;
    sa.sa_handler = signal_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = 0;
    
    sigaction(SIGINT, &sa, NULL);
    sigaction(SIGTERM, &sa, NULL);
}

void output_frame(struct libevdev *dev, int num_slots) {
    int first = 1;
    printf("[");
    
    for (int i = 0; i < num_slots; i++) {
        int tracking_id = -1;
        libevdev_fetch_slot_value(dev, i, ABS_MT_TRACKING_ID, &tracking_id);
        
        // Only output active touches (tracking_id >= 0 means finger is touching)
        if (tracking_id < 0) {
            continue;
        }
        
        int x = 0, y = 0, pressure = 0;
        int wmaj = 0, wmin = 0, tmaj = 0, tmin = 0;
        int distance = 0, angle = 0;
        
        libevdev_fetch_slot_value(dev, i, ABS_MT_POSITION_X, &x);
        libevdev_fetch_slot_value(dev, i, ABS_MT_POSITION_Y, &y);
        libevdev_fetch_slot_value(dev, i, ABS_MT_PRESSURE, &pressure);
        libevdev_fetch_slot_value(dev, i, ABS_MT_WIDTH_MAJOR, &wmaj);
        libevdev_fetch_slot_value(dev, i, ABS_MT_WIDTH_MINOR, &wmin);
        libevdev_fetch_slot_value(dev, i, ABS_MT_TOUCH_MAJOR, &tmaj);
        libevdev_fetch_slot_value(dev, i, ABS_MT_TOUCH_MINOR, &tmin);
        libevdev_fetch_slot_value(dev, i, ABS_MT_DISTANCE, &distance);
        libevdev_fetch_slot_value(dev, i, ABS_MT_ORIENTATION, &angle);
        
        if (!first) {
            printf(",");
        }
        first = 0;
        
        printf("{\"x\":%d,\"y\":%d,\"pressure\":%d,\"wmaj\":%d,\"wmin\":%d,\"tmaj\":%d,\"tmin\":%d,\"distance\":%d,\"angle\":%d}",
               x, y, pressure, wmaj, wmin, tmaj, tmin, distance, angle);
    }
    
    printf("]\n");
    fflush(stdout);
}

int main() {
    setup_signal_handlers();
    
    g_fd = open("/dev/input/event9", O_RDONLY | O_NONBLOCK);
    if (g_fd < 0) {
        fprintf(stderr, "open failed: No such file or directory\n");
        return 1;
    }

    int rc = libevdev_new_from_fd(g_fd, &g_dev);
    if (rc < 0) {
        fprintf(stderr, "Couldn't create libevdev context\n");
        cleanup();
        return 1;
    }

    if (!libevdev_has_event_type(g_dev, EV_ABS) || 
        !libevdev_has_event_code(g_dev, EV_ABS, ABS_MT_SLOT)) {
        fprintf(stderr, "Error: Device is not a touchpad\n");
        cleanup();
        return 1;
    }

    int num_slots = libevdev_get_num_slots(g_dev);
    if (num_slots < 0) {
        fprintf(stderr, "Type A MT device (no slots)\n");
        cleanup();
        return 1;
    }

    fprintf(stderr, "Available slots: %d\n", num_slots);
    fprintf(stderr, "Input device name: \"%s\"\n", libevdev_get_name(g_dev));

    // Event loop
    struct input_event ev;
    while (running) {
        rc = libevdev_next_event(g_dev, LIBEVDEV_READ_FLAG_NORMAL | LIBEVDEV_READ_FLAG_BLOCKING, &ev);
        
        if (rc == -EAGAIN) {
            // No events available, continue
            continue;
        }
        
        if (rc == LIBEVDEV_READ_STATUS_SYNC) {
            // Device needs sync, drain sync events
            while (rc == LIBEVDEV_READ_STATUS_SYNC) {
                rc = libevdev_next_event(g_dev, LIBEVDEV_READ_FLAG_SYNC, &ev);
            }
            continue;
        }
        
        if (rc < 0 && rc != -EAGAIN) {
            // Read error (device disconnected, etc.)
            fprintf(stderr, "Error reading events: %d\n", rc);
            break;
        }
        
        // On SYN_REPORT, a complete frame is ready - output current state
        if (ev.type == EV_SYN && ev.code == SYN_REPORT) {
            output_frame(g_dev, num_slots);
        }
    }

    fprintf(stderr, "Shutting down...\n");
    cleanup();
    return 0;
}
