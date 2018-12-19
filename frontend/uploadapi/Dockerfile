FROM python:2.7

RUN mkdir -p /app/uploadapi
WORKDIR /app

COPY ./* /app/uploadapi/
RUN pip install --no-cache-dir -r /app/uploadapi/requirements.txt

ENV PYTHONPATH='.'
CMD python -m uploadapi.upload -- -api -noreload

EXPOSE 5050

