FROM python:3.12-slim

WORKDIR /app

RUN groupadd --system shoreeats && useradd --system --gid shoreeats --home-dir /app shoreeats

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=shoreeats:shoreeats . .

USER shoreeats

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
