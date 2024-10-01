#!/usr/bin/env python
# -*- coding: utf-8 -*-
import asyncio
import websockets
import cv2
import numpy as np
from uvctypes import *
from queue import Queue
import time
import platform

BUF_SIZE = 2
q = Queue(BUF_SIZE)

async def stream_camera(websocket, path):
    while True:
        data = q.get(True, 500)
        if data is None:
            break
        data = cv2.resize(data[:, :], (640, 480))
        minVal, maxVal, minLoc, maxLoc = cv2.minMaxLoc(data)
        img = raw_to_8bit(data)
        img_rgb = cv2.applyColorMap(img, cv2.COLORMAP_JET)
        _, buffer = cv2.imencode('.jpg', img_rgb)
        await websocket.send(buffer.tobytes())

async def start_websocket_server():
    async with websockets.serve(stream_camera, "0.0.0.0", 8765):
        await asyncio.Future()  # Run forever

def py_frame_callback(frame, userptr):
    array_pointer = cast(frame.contents.data, POINTER(c_uint16 * (frame.contents.width * frame.contents.height)))
    data = np.frombuffer(array_pointer.contents, dtype=np.dtype(np.uint16)).reshape(frame.contents.height, frame.contents.width)

    if frame.contents.data_bytes != (2 * frame.contents.width * frame.contents.height):
        return

    if not q.full():
        q.put(data)

PTR_PY_FRAME_CALLBACK = CFUNCTYPE(None, POINTER(uvc_frame), c_void_p)(py_frame_callback)

def ktof(val):
    return (1.8 * ktoc(val) + 32.0)

def ktoc(val):
    return (val - 27315) / 100.0

def raw_to_8bit(data):
    cv2.normalize(data, data, 0, 65535, cv2.NORM_MINMAX)
    np.right_shift(data, 8, data)
    return cv2.cvtColor(np.uint8(data), cv2.COLOR_GRAY2RGB)

if __name__ == "__main__":
    ctx = POINTER(uvc_context)()
    dev = POINTER(uvc_device)()
    global devh
    devh = POINTER(uvc_device_handle)()
    ctrl = uvc_stream_ctrl()

    res = libuvc.uvc_init(byref(ctx), 0)
    if res < 0:
        print("uvc_init error")
        exit(1)

    res = libuvc.uvc_find_device(ctx, byref(dev), PT_USB_VID, PT_USB_PID, 0)
    if res < 0:
        print("uvc_find_device error")
        exit(1)

    res = libuvc.uvc_open(dev, byref(devh))
    if res < 0:
        print("uvc_open error")
        exit(1)

    frame_formats = uvc_get_frame_formats_by_guid(devh, VS_FMT_GUID_Y16)
    if len(frame_formats) == 0:
        print("device does not support Y16")
        exit(1)

    libuvc.uvc_get_stream_ctrl_format_size(devh, byref(ctrl), UVC_FRAME_FORMAT_Y16, frame_formats[0].wWidth, frame_formats[0].wHeight, int(1e7 / frame_formats[0].dwDefaultFrameInterval))

    res = libuvc.uvc_start_streaming(devh, byref(ctrl), PTR_PY_FRAME_CALLBACK, None, 0)
    if res < 0:
        print("uvc_start_streaming failed: {0}".format(res))
        exit(1)

    # Start WebSocket server
    asyncio.run(start_websocket_server())
