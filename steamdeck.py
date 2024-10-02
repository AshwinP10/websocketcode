import asyncio
import websockets
import cv2
import numpy as np
import base64

async def receive_video_stream():
    uri = "ws://<Raspberry_Pi_IP>:5678"  # Replace <Raspberry_Pi_IP> with your Raspberry Pi's IP address
    
    async with websockets.connect(uri) as websocket:
        while True:
            # Receive the base64-encoded frame
            frame_data = await websocket.recv()

            # Decode the base64 string back to bytes
            jpg_original = base64.b64decode(frame_data)

            # Convert the byte array back into a NumPy array
            np_arr = np.frombuffer(jpg_original, np.uint8)

            # Decode the image from the NumPy array
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Display the image in a window
            cv2.imshow("Live Stream", img)

            # Exit on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    # Close OpenCV windows
    cv2.destroyAllWindows()

# Run the WebSocket client
asyncio.get_event_loop().run_until_complete(receive_video_stream())
