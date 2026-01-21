#!/bin/bash

gcc main.c -o myprog $(pkg-config --cflags --libs libevdev)