#!/usr/bin/env python
# -*- coding: utf-8 -*-
import asyncio
import websockets
import cv2
import numpy as np
from flask import Flask, render_template, Response

app = Flask(__name__)
frames_queue = asyncio.Queue()

async def receive_frames():
    uri = "ws://<Raspberry-Pi-IP>:8765"  # Replace with Raspberry Pi's IP
    async with websockets.connect(uri) as websocket:
        while True:
            frame = await websocket.recv()
            await frames_queue.put(frame)

def generate_frames():
    while True:
        frame = frames_queue.get_nowait()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    # Start WebSocket client in the background
    asyncio.get_event_loop().run_until_complete(receive_frames())
    app.run(host="0.0.0.0", port=5000)
