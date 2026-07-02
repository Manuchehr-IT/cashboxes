import asyncio

import uvicorn

from src.api.app import create_app


async def run() -> None:
	app = create_app()

	config = uvicorn.Config(app=app, host="0.0.0.0", port=8000, log_level="info")
	server = uvicorn.Server(config)
	await server.serve()

if __name__ == "__main__":
	asyncio.run(run())
