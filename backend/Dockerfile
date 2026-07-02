FROM python:3.11-slim

WORKDIR /app

# Установка Python зависимостей
ARG INSTALL_DEV=false
COPY requirements*.txt ./
RUN if [ "$INSTALL_DEV" = "true" ]; then \
		pip install --no-cache-dir -r requirements-dev.txt; \
	else \
		pip install --no-cache-dir -r requirements.txt; \
	fi

# Копирование проекта
COPY . /app

# Указываем переменные окружения (можно переопределить при запуске)
ENV PYTHONUNBUFFERED=1

# Команда запуска
CMD ["python3", "-u", "-m", "src.main"]
