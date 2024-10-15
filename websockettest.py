import asyncio
import websockets

def test_url(url, data=""):
    async def inner():
        async with websockets.connect(url) as websocket:
            await websocket.send(data)

    return asyncio.get_event_loop().run_until_complete(inner())

Test the WebSocket connection with the Raspberry Pi IP and port
test_url("ws://2ccf67506665.dynamic.utexas.edu:8610")
