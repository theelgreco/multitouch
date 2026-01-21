#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <errno.h>
#include <string.h>
#include <strings.h>
#include <dirent.h>
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

// Check if a device has touchpad capabilities
static int is_touchpad(struct libevdev *dev) {
    // Must have BTN_TOUCH and BTN_TOOL_FINGER
    if (!libevdev_has_event_code(dev, EV_KEY, BTN_TOUCH))
        return 0;
    if (!libevdev_has_event_code(dev, EV_KEY, BTN_TOOL_FINGER))
        return 0;
    
    // Must have absolute position
    if (!libevdev_has_event_code(dev, EV_ABS, ABS_X))
        return 0;
    if (!libevdev_has_event_code(dev, EV_ABS, ABS_Y))
        return 0;
    
    // Exclude touchscreens (direct input devices)
    if (libevdev_has_property(dev, INPUT_PROP_DIRECT))
        return 0;
    
    return 1;
}

// Check if device name matches known touchpad patterns (case-insensitive)
static int is_priority_touchpad_name(const char *name) {
    if (!name) return 0;
    
    // Priority patterns for common touchpad manufacturers/types
    const char *patterns[] = {
        "touchpad",
        "trackpad",
        "synaptics",
        "elan",
        "alps",
        "bcm5974",
        NULL
    };
    
    for (int i = 0; patterns[i] != NULL; i++) {
        if (strcasestr(name, patterns[i]) != NULL) {
            return 1;
        }
    }
    return 0;
}

// Find and open a touchpad device
// Returns 0 on success (sets g_fd and g_dev), -1 on failure
static int find_touchpad(void) {
    DIR *dir = opendir("/dev/input");
    if (!dir) {
        fprintf(stderr, "Error: Cannot open /dev/input: %s\n", strerror(errno));
        return -1;
    }
    
    struct dirent *entry;
    int fallback_fd = -1;
    struct libevdev *fallback_dev = NULL;
    char fallback_path[256] = {0};
    
    while ((entry = readdir(dir)) != NULL) {
        // Only look at event* files
        if (strncmp(entry->d_name, "event", 5) != 0)
            continue;
        
        char path[1024];
        snprintf(path, sizeof(path), "/dev/input/%s", entry->d_name);
        
        int fd = open(path, O_RDONLY | O_NONBLOCK);
        if (fd < 0) {
            // Skip devices we can't open (permission errors, etc.)
            continue;
        }
        
        struct libevdev *dev = NULL;
        int rc = libevdev_new_from_fd(fd, &dev);
        if (rc < 0) {
            close(fd);
            continue;
        }
        
        // Check if this is a valid touchpad
        if (!is_touchpad(dev)) {
            libevdev_free(dev);
            close(fd);
            continue;
        }
        
        const char *name = libevdev_get_name(dev);
        
        // Check if this matches a priority name pattern
        if (is_priority_touchpad_name(name)) {
            // Found a priority touchpad - use it immediately
            fprintf(stderr, "Found touchpad: %s (%s)\n", name, path);
            
            // Clean up fallback if we had one
            if (fallback_dev) {
                libevdev_free(fallback_dev);
                close(fallback_fd);
            }
            
            g_fd = fd;
            g_dev = dev;
            closedir(dir);
            return 0;
        }
        
        // Valid touchpad but not priority - save as fallback
        if (fallback_fd < 0) {
            fallback_fd = fd;
            fallback_dev = dev;
            strncpy(fallback_path, path, sizeof(fallback_path) - 1);
        } else {
            // Already have a fallback, skip this one
            libevdev_free(dev);
            close(fd);
        }
    }
    
    closedir(dir);
    
    // If no priority device found, use fallback
    if (fallback_fd >= 0) {
        const char *name = libevdev_get_name(fallback_dev);
        fprintf(stderr, "Found touchpad: %s (%s)\n", name ? name : "Unknown", fallback_path);
        g_fd = fallback_fd;
        g_dev = fallback_dev;
        return 0;
    }
    
    fprintf(stderr, "Error: No touchpad device found\n");
    fprintf(stderr, "Make sure you have permission to read /dev/input/event* devices\n");
    fprintf(stderr, "(You may need to run as root or add your user to the 'input' group)\n");
    return -1;
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
    
    // Find and open a touchpad device
    if (find_touchpad() < 0) {
        return 1;
    }

    if (!libevdev_has_event_type(g_dev, EV_ABS) || 
        !libevdev_has_event_code(g_dev, EV_ABS, ABS_MT_SLOT)) {
        fprintf(stderr, "Error: Device does not support multitouch slots\n");
        cleanup();
        return 1;
    }

    int num_slots = libevdev_get_num_slots(g_dev);
    if (num_slots < 0) {
        fprintf(stderr, "Type A MT device (no slots)\n");
        cleanup();
        return 1;
    }

    // Event loop
    struct input_event ev;
    while (running) {
        int rc = libevdev_next_event(g_dev, LIBEVDEV_READ_FLAG_NORMAL | LIBEVDEV_READ_FLAG_BLOCKING, &ev);
        
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
