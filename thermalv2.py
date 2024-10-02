import asyncio
import websockets
import cv2
import base64
import numpy as np
from uvctypes import *
from queue import Queue
import time

BUF_SIZE = 2
q = Queue(BUF_SIZE)

# Callback function to get the UVC frame
def py_frame_callback(frame, userptr):
    array_pointer = cast(frame.contents.data, POINTER(c_uint16 * (frame.contents.width * frame.contents.height)))
    data = np.frombuffer(
        array_pointer.contents, dtype=np.dtype(np.uint16)
    ).reshape(
        frame.contents.height, frame.contents.width
    )

    if frame.contents.data_bytes != (2 * frame.contents.width * frame.contents.height):
        return

    if not q.full():
        q.put(data)

PTR_PY_FRAME_CALLBACK = CFUNCTYPE(None, POINTER(uvc_frame), c_void_p)(py_frame_callback)

# Initialize UVC camera and start streaming
def init_camera():
    ctx = POINTER(uvc_context)()
    dev = POINTER(uvc_device)()
    devh = POINTER(uvc_device_handle)()
    ctrl = uvc_stream_ctrl()

    res = libuvc.uvc_init(byref(ctx), 0)
    if res < 0:
        print("uvc_init error")
        exit(1)

    res = libuvc.uvc_find_device(ctx, byref(dev), 0, 0, 0)
    if res < 0:
        print("uvc_find_device error")
        exit(1)

    res = libuvc.uvc_open(dev, byref(devh))
    if res < 0:
        print("uvc_open error")
        exit(1)

    frame_formats = uvc_get_frame_formats_by_guid(devh, VS_FMT_GUID_Y16)
    if len(frame_formats) == 0:
        print("Device does not support Y16")
        exit(1)

    libuvc.uvc_get_stream_ctrl_format_size(devh, byref(ctrl), UVC_FRAME_FORMAT_Y16,
                                           frame_formats[0].wWidth, frame_formats[0].wHeight, int(1e7 / frame_formats[0].dwDefaultFrameInterval))

    res = libuvc.uvc_start_streaming(devh, byref(ctrl), PTR_PY_FRAME_CALLBACK, None, 0)
    if res < 0:
        print("uvc_start_streaming failed")
        exit(1)

    return devh

# Convert raw UVC frame data to an 8-bit image
def raw_to_8bit(data):
    cv2.normalize(data, data, 0, 65535, cv2.NORM_MINMAX)
    np.right_shift(data, 8, data)
    return cv2.cvtColor(np.uint8(data), cv2.COLOR_GRAY2RGB)

# Async WebSocket function to send video frames
async def video_stream(websocket, path):
    devh = init_camera()  # Initialize the UVC camera
    while True:
        data = q.get(True, 500)  # Get camera frame from the queue
        if data is None:
            break

        data = cv2.resize(data[:, :], (640, 480))  # Resize the frame
        img = raw_to_8bit(data)  # Convert to 8-bit image

        # Apply color map to make it more visible
        img_rgb = cv2.applyColorMap(img, cv2.COLORMAP_JET)

        # Encode the frame to JPEG
        _, buffer = cv2.imencode('.jpg', img_rgb)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # Send the encoded frame over WebSocket
        await websocket.send(jpg_as_text)

        # Small delay to avoid overwhelming the client
        await asyncio.sleep(0.1)

    libuvc.uvc_stop_streaming(devh)

# Start WebSocket server on the Raspberry Pi
start_server = websockets.serve(video_stream, "0.0.0.0", 5678)

# Start the event loop
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

