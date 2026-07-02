import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from httpx import AsyncClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.api.exceptions.handlers import setup_exception_handlers
from src.api.middlewares import trace_id_middleware
from src.api.router import api_router
from src.core.config import settings
from src.core.logger import setup_logging
from src.infrastructure.external.http.client import HTTPClient

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
	setup_logging()

	@asynccontextmanager
	async def lifespan(app: FastAPI):
		app.state.http_client = HTTPClient(AsyncClient(timeout=10))
		app.state.redis = Redis.from_url(str(settings.redis.dsn), decode_responses=True)  # pyright: ignore[reportUnknownMemberType] -- redis-py's from_url has untyped **kwargs upstream

		app.state.engine = create_async_engine(
			url=str(settings.database.async_dsn),
			pool_pre_ping=True,
		)

		app.state.session_maker = async_sessionmaker(
			bind=app.state.engine,
			class_=AsyncSession,
			expire_on_commit=False,
			autoflush=True,
		)

		yield

		logger.info("🔴 Shutting down...")

		await app.state.engine.dispose()
		await app.state.redis.aclose()
		await app.state.http_client.close()

	app = FastAPI(
		title=settings.app.title,
		version="1.0.0",
		lifespan=lifespan,
		docs_url="/api/docs" if settings.app.debug else None,
		swagger_ui_parameters={
			"persistAuthorization": True,
			# "operationsSorter": "method",
		}
	)

	setup_exception_handlers(app)

	app.middleware("http")(trace_id_middleware)

	app.add_middleware(
		CORSMiddleware,
		allow_origins=settings.app.allowed_origins,
		# allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	app.include_router(api_router)

	app.mount("/storage", StaticFiles(directory="storage"), name="storage")

	return app
