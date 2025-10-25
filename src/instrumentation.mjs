/*instrumentation.mjs*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
    PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { logger } from './logger.js';
import { config } from 'dotenv';

config();

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: 'videotube-backend',
        [ATTR_SERVICE_VERSION]: '1.0.0',
    }),
    traceExporter: new OTLPTraceExporter({
        url: `${process.env.OTEL_NODE}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${process.env.OTEL_NODE}/v1/metrics`,
        }),
        exportIntervalMillis: 60000,
    }),
    logRecordProcessors: [
        new BatchLogRecordProcessor(new OTLPLogExporter({
            url: `${process.env.OTEL_NODE}/v1/logs`,
        })),
    ],
    instrumentations: [
        getNodeAutoInstrumentations(),
        new WinstonInstrumentation(),
    ],
});

sdk.start();

logger.info('OpenTelemetry SDK initialized');
