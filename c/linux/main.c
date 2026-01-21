#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <libevdev-1.0/libevdev/libevdev.h>

void clean_exit(struct libevdev *dev, int fd) {
    close(fd);
    libevdev_free(dev);
    exit(1);
}

int main() {    
    struct libevdev *dev = NULL;

    int fd = open("/dev/input/event9", O_RDONLY | O_NONBLOCK);
    if(fd == -1) {
        printf("open failed: No such file or directory\n");
        exit(1);
    }

    int rc = libevdev_new_from_fd(fd, &dev);
    if(rc < 0) {
        printf("Couldn't create libevdev context\n");
        clean_exit(dev, fd);
    }

    if(!libevdev_has_event_type(dev, EV_ABS) || !libevdev_has_event_code(dev, EV_ABS, ABS_MT_SLOT)) {
        printf("Error: Device is not a touchpad\n");
        clean_exit(dev, fd);
    }

    int available_slots = libevdev_get_num_slots(dev);
    if(available_slots < 0) {
        printf("Type A MT device (no slots)\n");
        clean_exit(dev, fd);
    }

    printf("Available slots: %d\n", available_slots);
    printf("Input device name: \"%s\"\n", libevdev_get_name(dev));

    // Consume pending events so slot values are updated
    struct input_event ev;
    while(libevdev_next_event(dev, LIBEVDEV_READ_FLAG_NORMAL, &ev) == 0) {
        // nothing needed inside loop
    }

    printf("[\n");
    for(int i = 0; i < available_slots; i++) {
        int x = -1;
        int y = -1;
        int pressure = -1;
        int wmaj = -1;
        int wmin = -1;
        int tmaj = -1;
        int tmin = -1;
        int distance = -1;
        int angle = -1;

        libevdev_fetch_slot_value(dev, i, ABS_MT_POSITION_X, &x);
        libevdev_fetch_slot_value(dev, i, ABS_MT_POSITION_Y, &y);
        libevdev_fetch_slot_value(dev, i, ABS_MT_PRESSURE, &pressure);
        libevdev_fetch_slot_value(dev, i, ABS_MT_WIDTH_MAJOR, &wmaj);
        libevdev_fetch_slot_value(dev, i, ABS_MT_WIDTH_MINOR, &wmin);
        libevdev_fetch_slot_value(dev, i, ABS_MT_TOUCH_MAJOR, &tmaj);
        libevdev_fetch_slot_value(dev, i, ABS_MT_TOUCH_MINOR, &tmin);
        libevdev_fetch_slot_value(dev, i, ABS_MT_DISTANCE, &distance);
        libevdev_fetch_slot_value(dev, i, ABS_MT_ORIENTATION, &angle);

        printf("    { x: %d, y: %d, pressure: %d, wmaj: %d, wmin: %d, tmaj: %d, tmin: %d, distance: %d, angle: %d }%s\n",
               x, y, pressure, wmaj, wmin, tmaj, tmin, distance, angle,
               (i == available_slots - 1) ? "" : ",");
    }
    printf("]\n");

    libevdev_free(dev);
    close(fd);
    return 0;
}
