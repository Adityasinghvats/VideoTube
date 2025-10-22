import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { metrics, SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("healthcheck-controller", "1.0.0");
const meter = metrics.getMeter("healthcheck-controller", "1.0.0");

// counter to track number of healthcheck requests
const counter = meter.createCounter("healthcheck_requests_total", {
    description: "Total number of healthcheck requests",
});

const healthcheck = asyncHandler(async (req, res) => {
    return tracer.startActiveSpan("healthcheck-span", async (span) => {
        // span.setAttribute("http.method", req.method);
        // span.setStatus({
        //     code: SpanStatusCode.OK,
        //     message: "Health Check Passed",
        // })
        // use inside try catch blocks for error reporting
        // span.addEvent("Healthcheck endpoint was called");
        // span.recordException(new Error("Healthcheck executed successfully"));
        counter.add(1, { route: "/api/v1/healthcheck" });
        span.end();
        return res
            .status(200)
            .json(new ApiResponse(200, "OK", "Health Check Passed"));
    });
})

export { healthcheck }