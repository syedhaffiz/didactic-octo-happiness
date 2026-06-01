// OpenAPI 3.0 specification for the Control Tower backend.
//
// Hand-authored as a TS module — keeps the spec versionable alongside the
// route handlers and avoids juggling YAML. Component schemas mirror the
// TypeScript interfaces in `src/types/*` one-for-one; when you add a field to
// a type, add it here too (the matching is mechanical and visible at PR
// review).
//
// Served at:
//   GET /api/docs           → Swagger UI (interactive)
//   GET /api/openapi.json   → raw spec (for client code generation)

const envelope = (dataSchema: object) => ({
  type: "object",
  properties: {
    data: dataSchema,
    meta: { type: "object", additionalProperties: true },
    error: { $ref: "#/components/schemas/ApiError" },
  },
});

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Control Tower API",
    version: "0.1.0",
    description:
      "Backend for the IRM Control Tower dashboard. All endpoints return an " +
      "ApiEnvelope: `{ data, meta?, error? }`. On success `data` is populated; " +
      "on failure `error` is populated and the HTTP status is non-2xx.",
  },
  servers: [
    { url: "http://localhost:4000/api", description: "Local dev" },
  ],
  tags: [
    { name: "Health" },
    { name: "Finance" },
    { name: "Inventory" },
    { name: "Filters", description: "Reference data for dropdowns" },
  ],

  paths: {
    // --- Health -----------------------------------------------------------
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        responses: {
          "200": {
            description: "Service is up",
            content: {
              "application/json": {
                schema: envelope({
                  type: "object",
                  required: ["status", "uptime"],
                  properties: {
                    status: { type: "string", example: "ok" },
                    uptime: { type: "number", description: "Process uptime in seconds" },
                  },
                }),
              },
            },
          },
        },
      },
    },

    // --- Finance ----------------------------------------------------------
    "/finance/overview": {
      get: {
        tags: ["Finance"],
        summary: "Top-of-page KPIs + forex strip for the Finance dashboard",
        parameters: [{ $ref: "#/components/parameters/DateRange" }],
        responses: { "200": envelopeResponse("OverviewResponse") },
      },
    },
    "/finance/kpis": {
      get: {
        tags: ["Finance"],
        summary: "Just the KPI cards (subset of /finance/overview)",
        parameters: [{ $ref: "#/components/parameters/DateRange" }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: envelope({ type: "array", items: { $ref: "#/components/schemas/KPI" } }),
              },
            },
          },
        },
      },
    },
    "/finance/forex": {
      get: {
        tags: ["Finance"],
        summary: "USD/INR forex strip",
        parameters: [
          {
            name: "range",
            in: "query",
            schema: { type: "string", enum: ["all", "week", "month"] },
            description: "Defaults to `week`",
          },
        ],
        responses: { "200": envelopeResponse("ForexResponse") },
      },
    },
    "/finance/revenue": {
      get: {
        tags: ["Finance"],
        summary: "Revenue breakdown (cards, donut, ledger)",
        parameters: [
          { $ref: "#/components/parameters/DateRange" },
          { $ref: "#/components/parameters/Port" },
        ],
        responses: { "200": envelopeResponse("BreakdownResponse") },
      },
    },
    "/finance/working-capital": {
      get: {
        tags: ["Finance"],
        summary: "Working capital breakdown",
        parameters: [
          { $ref: "#/components/parameters/DateRange" },
          { $ref: "#/components/parameters/Port" },
        ],
        responses: { "200": envelopeResponse("BreakdownResponse") },
      },
    },
    "/finance/profitability": {
      get: {
        tags: ["Finance"],
        summary: "Profitability bar chart + vessel ledger",
        parameters: [
          { $ref: "#/components/parameters/DateRange" },
          {
            name: "mode",
            in: "query",
            schema: { type: "string", enum: ["port", "segment"] },
            description: "Defaults to `port`",
          },
          { $ref: "#/components/parameters/Port" },
          {
            name: "segment",
            in: "query",
            schema: { type: "string" },
            description: "Used when mode=segment",
          },
        ],
        responses: { "200": envelopeResponse("ProfitabilityResponse") },
      },
    },
    "/finance/sales": {
      get: {
        tags: ["Finance"],
        summary: "Budget-vs-actual sales by port / zone / segment",
        parameters: [{ $ref: "#/components/parameters/DateRange" }],
        responses: { "200": envelopeResponse("SalesResponse") },
      },
    },
    "/finance/approved-budget": {
      get: {
        tags: ["Finance"],
        summary: "Approved budget – volume + margin time series, PBD, inventory gauge",
        parameters: [
          { $ref: "#/components/parameters/Port" },
          { name: "grade", in: "query", schema: { type: "string" } },
          { name: "zone", in: "query", schema: { type: "string" } },
          { name: "origin", in: "query", schema: { type: "string" } },
          { name: "fy", in: "query", schema: { type: "string" }, description: "Financial year, e.g. `FY26`" },
        ],
        responses: { "200": envelopeResponse("ApprovedBudgetResponse") },
      },
    },

    // --- Inventory --------------------------------------------------------
    "/inventory/index": {
      get: {
        tags: ["Inventory"],
        summary: "Coal price indices (ICI 4, API 4, API 5)",
        description:
          "Bulk endpoint — returns all indices for a single range. Useful for the " +
          "initial render. For per-card range filters, use `GET /inventory/index/{code}`.",
        parameters: [
          {
            name: "range",
            in: "query",
            schema: { type: "string", enum: ["1W", "1M", "3M", "1Y"] },
            description: "Defaults to `1M`",
          },
        ],
        responses: { "200": envelopeResponse("IndexResponse") },
      },
    },
    "/inventory/index/{code}": {
      get: {
        tags: ["Inventory"],
        summary: "Single coal price index, with its own range filter",
        description:
          "Returns the time series for one index. Each card on the Inventory Index " +
          "page calls this so its range dropdown is independent.",
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "URL-encoded index code, e.g. `ICI%204`, `API%204`, `API%205`",
          },
          {
            name: "range",
            in: "query",
            schema: { type: "string", enum: ["1W", "1M", "3M", "1Y"] },
            description: "Defaults to `1M`",
          },
        ],
        responses: {
          "200": envelopeResponse("PriceIndex"),
          "404": {
            description: "Unknown code",
            content: {
              "application/json": {
                schema: envelope({ $ref: "#/components/schemas/ApiError" }),
              },
            },
          },
        },
      },
    },
    "/inventory/overview": {
      get: {
        tags: ["Inventory"],
        summary: "Inventory KPIs, port stock, dispatch, sales, vessels",
        parameters: [
          { $ref: "#/components/parameters/Port" },
          {
            name: "origin",
            in: "query",
            schema: { type: "string" },
            description: "Origin id (the `id` field from /filters → origins)",
          },
          {
            name: "grade",
            in: "query",
            schema: { type: "string" },
            description: "Grade id (the `id` field from /filters → grades)",
          },
        ],
        responses: { "200": envelopeResponse("InventoryOverviewResponse") },
      },
    },

    // --- Filters (reference data) -----------------------------------------
    "/filters": {
      get: {
        tags: ["Filters"],
        summary: "All reference lists used by dropdowns",
        description:
          "Returns every dropdown's option list in a single payload. The UI " +
          "fetches this once on session start and caches it in memory, so " +
          "each filter dropdown reads its slice without an additional " +
          "round-trip.",
        responses: { "200": envelopeResponse("FiltersResponse") },
      },
    },
  },

  components: {
    parameters: {
      DateRange: {
        name: "dateRange",
        in: "query",
        schema: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}:\\d{4}-\\d{2}-\\d{2}$" },
        description: "Date range as `YYYY-MM-DD:YYYY-MM-DD`. Omit for default window.",
      },
      Port: {
        name: "port",
        in: "query",
        schema: { type: "string" },
        description: "Port id (the `id` field from /filters → ports)",
      },
    },

    schemas: {
      // --- Envelope ----------------------------------------------------
      ApiError: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string", example: "validation_error" },
          message: { type: "string" },
          details: {},
        },
      },

      // --- Filters -----------------------------------------------------
      FilterRef: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string", example: "mundra" },
          name: { type: "string", example: "Mundra" },
        },
      },
      GradeRef: {
        type: "object",
        required: ["id", "name", "group_name"],
        properties: {
          id: { type: "string", example: "indo-4200-gar" },
          name: { type: "string", example: "INDO-4200 GAR" },
          group_name: { type: "string", example: "INDO" },
        },
      },
      IndexNameRef: {
        type: "object",
        required: ["index_name", "code_id"],
        properties: {
          index_name: { type: "string", example: "api4", description: "Short slug" },
          code_id: { type: "string", example: "API 4", description: "Display code" },
        },
      },
      FiltersResponse: {
        type: "object",
        required: ["ports", "segments", "zones", "origins", "grades", "indexNames"],
        properties: {
          ports: { type: "array", items: { $ref: "#/components/schemas/FilterRef" } },
          segments: { type: "array", items: { $ref: "#/components/schemas/FilterRef" } },
          zones: { type: "array", items: { $ref: "#/components/schemas/FilterRef" } },
          origins: { type: "array", items: { $ref: "#/components/schemas/FilterRef" } },
          grades: { type: "array", items: { $ref: "#/components/schemas/GradeRef" } },
          indexNames: { type: "array", items: { $ref: "#/components/schemas/IndexNameRef" } },
        },
      },

      // --- Finance: KPIs + Forex --------------------------------------
      KPI: {
        type: "object",
        required: ["id", "label", "value", "unit", "deltaPct", "trend", "spark", "href"],
        properties: {
          id: {
            type: "string",
            enum: ["revenue", "sales", "profitability", "workingCapital", "dispatch", "inventoryDays"],
          },
          label: { type: "string" },
          value: { type: "number" },
          unit: { type: "string", enum: ["Cr", "MMT", "Days"] },
          deltaPct: { type: "number" },
          trend: { type: "string", enum: ["up", "down"] },
          spark: { type: "array", items: { type: "number" } },
          href: { type: "string" },
        },
      },
      ForexPoint: {
        type: "object",
        required: ["day", "rate"],
        properties: {
          day: { type: "string" },
          rate: { type: "number" },
        },
      },
      ForexResponse: {
        type: "object",
        required: ["range", "points", "exchangeRate", "monthAverage"],
        properties: {
          range: { type: "string", enum: ["all", "week", "month"] },
          points: { type: "array", items: { $ref: "#/components/schemas/ForexPoint" } },
          exchangeRate: { type: "number" },
          monthAverage: { type: "number" },
        },
      },
      OverviewResponse: {
        type: "object",
        required: ["kpis", "forex"],
        properties: {
          kpis: { type: "array", items: { $ref: "#/components/schemas/KPI" } },
          forex: { $ref: "#/components/schemas/ForexResponse" },
        },
      },

      // --- Finance: Breakdown (Revenue / Working Capital) --------------
      BreakdownItem: {
        type: "object",
        required: ["segment", "value", "unit"],
        properties: {
          segment: { type: "string" },
          value: { type: "number" },
          unit: { type: "string", enum: ["Cr"] },
        },
      },
      DonutSlice: {
        type: "object",
        required: ["segment", "value", "pct"],
        properties: {
          segment: { type: "string" },
          value: { type: "number" },
          pct: { type: "number" },
        },
      },
      DonutResponse: {
        type: "object",
        required: ["total", "unit", "slices"],
        properties: {
          total: { type: "number" },
          unit: { type: "string", enum: ["Cr"] },
          slices: { type: "array", items: { $ref: "#/components/schemas/DonutSlice" } },
        },
      },
      LedgerRow: {
        type: "object",
        required: ["companyCode", "accountNumber", "profitCentre", "segment", "grouping", "debit", "credit"],
        properties: {
          companyCode: { type: "string" },
          accountNumber: { type: "string" },
          profitCentre: { type: "string" },
          segment: { type: "string" },
          grouping: { type: "string" },
          debit: { type: "number" },
          credit: { type: "number" },
        },
      },
      BreakdownResponse: {
        type: "object",
        required: ["breakdown", "donut", "ledger"],
        properties: {
          breakdown: { type: "array", items: { $ref: "#/components/schemas/BreakdownItem" } },
          donut: { $ref: "#/components/schemas/DonutResponse" },
          ledger: { type: "array", items: { $ref: "#/components/schemas/LedgerRow" } },
        },
      },

      // --- Finance: Profitability --------------------------------------
      ProfitabilityBar: {
        type: "object",
        required: ["category", "value"],
        properties: {
          category: { type: "string" },
          value: { type: "number" },
        },
      },
      ProfitabilityVesselRow: {
        type: "object",
        required: ["batchId", "vessel", "grade", "origin", "port", "segment", "profit"],
        properties: {
          batchId: { type: "string" },
          vessel: { type: "string" },
          grade: { type: "string" },
          origin: { type: "string" },
          port: { type: "string" },
          segment: { type: "string" },
          profit: { type: "number" },
        },
      },
      ProfitabilityResponse: {
        type: "object",
        required: ["mode", "chart", "vessels"],
        properties: {
          mode: { type: "string", enum: ["port", "segment"] },
          chart: { type: "array", items: { $ref: "#/components/schemas/ProfitabilityBar" } },
          vessels: { type: "array", items: { $ref: "#/components/schemas/ProfitabilityVesselRow" } },
        },
      },

      // --- Finance: Sales ---------------------------------------------
      BudgetActualRow: {
        type: "object",
        required: ["category", "budget", "actual", "unit"],
        properties: {
          category: { type: "string" },
          budget: { type: "number" },
          actual: { type: "number" },
          unit: { type: "string", enum: ["MMT", "MT"] },
        },
      },
      SalesResponse: {
        type: "object",
        required: ["portwise", "zonewise", "segmentwise"],
        properties: {
          portwise: { type: "array", items: { $ref: "#/components/schemas/BudgetActualRow" } },
          zonewise: { type: "array", items: { $ref: "#/components/schemas/BudgetActualRow" } },
          segmentwise: { type: "array", items: { $ref: "#/components/schemas/BudgetActualRow" } },
        },
      },

      // --- Finance: Approved Budget -----------------------------------
      BudgetSeries: {
        type: "object",
        required: ["months", "budget", "actual", "unit"],
        properties: {
          months: { type: "array", items: { type: "string" } },
          budget: { type: "array", items: { type: "number", nullable: true } },
          actual: { type: "array", items: { type: "number", nullable: true } },
          unit: { type: "string", enum: ["MT", "Cr"] },
        },
      },
      PbdRow: {
        type: "object",
        required: ["port", "days"],
        properties: {
          port: { type: "string" },
          days: { type: "number" },
        },
      },
      InventorySlice: {
        type: "object",
        required: ["segment", "days"],
        properties: {
          segment: { type: "string" },
          days: { type: "number" },
        },
      },
      InventoryGauge: {
        type: "object",
        required: ["max", "slices"],
        properties: {
          max: { type: "number" },
          slices: { type: "array", items: { $ref: "#/components/schemas/InventorySlice" } },
        },
      },
      ApprovedBudgetResponse: {
        type: "object",
        required: ["fy", "volume", "margin", "pbd", "inventory"],
        properties: {
          fy: { type: "string", example: "FY26" },
          volume: { $ref: "#/components/schemas/BudgetSeries" },
          margin: { $ref: "#/components/schemas/BudgetSeries" },
          pbd: { type: "array", items: { $ref: "#/components/schemas/PbdRow" } },
          inventory: { $ref: "#/components/schemas/InventoryGauge" },
        },
      },

      // --- Inventory --------------------------------------------------
      PricePoint: {
        type: "object",
        required: ["date", "value"],
        properties: {
          date: { type: "string", format: "date" },
          value: { type: "number" },
        },
      },
      PriceIndex: {
        type: "object",
        required: ["code", "cadence", "range", "series", "current", "currentDate"],
        properties: {
          code: { type: "string", example: "ICI 4" },
          cadence: { type: "string", enum: ["Daily", "Weekly"] },
          range: { type: "string", enum: ["1W", "1M", "3M", "1Y"] },
          series: { type: "array", items: { $ref: "#/components/schemas/PricePoint" } },
          current: { type: "number" },
          currentDate: { type: "string", format: "date" },
        },
      },
      IndexResponse: {
        type: "object",
        required: ["asOf", "items"],
        properties: {
          asOf: { type: "string", format: "date" },
          items: { type: "array", items: { $ref: "#/components/schemas/PriceIndex" } },
        },
      },
      InventoryKpi: {
        type: "object",
        required: ["id", "title", "primaryLabel", "primaryValue", "secondaryLabel", "secondaryValue", "lastUpdated"],
        properties: {
          id: { type: "string", enum: ["physicalInventory", "salesBooking", "dispatch", "vessels"] },
          title: { type: "string" },
          primaryLabel: { type: "string" },
          primaryValue: { type: "number" },
          primaryUnit: { type: "string" },
          secondaryLabel: { type: "string" },
          secondaryValue: { type: "number" },
          secondaryUnit: { type: "string" },
          lastUpdated: { type: "string", format: "date" },
        },
      },
      PortInventoryRow: {
        type: "object",
        required: ["port", "physicalStock", "physicalUnsold"],
        properties: {
          port: { type: "string" },
          physicalStock: { type: "number" },
          physicalUnsold: { type: "number" },
        },
      },
      DispatchSummary: {
        type: "object",
        required: ["last24Hours", "last7Days", "mtdAggregate", "deltaPct", "unit"],
        properties: {
          last24Hours: { type: "number" },
          last7Days: { type: "number" },
          mtdAggregate: { type: "number" },
          deltaPct: { type: "number" },
          unit: { type: "string", enum: ["MT"] },
        },
      },
      SalesMonth: {
        type: "object",
        required: ["month", "value"],
        properties: {
          month: { type: "string" },
          value: { type: "number" },
        },
      },
      InventoryVesselRow: {
        type: "object",
        required: ["vessel", "coalGrade", "tonnage", "origin", "blDate", "etaDp"],
        properties: {
          vessel: { type: "string" },
          coalGrade: { type: "string" },
          tonnage: { type: "number" },
          origin: { type: "string" },
          blDate: { type: "string", format: "date" },
          etaDp: { type: "string", format: "date" },
        },
      },
      InventoryOverviewResponse: {
        type: "object",
        required: ["asOf", "kpis", "currentInventory", "dispatch", "sales", "vesselsSailedOut", "vesselsUnderloading"],
        properties: {
          asOf: { type: "string", format: "date" },
          kpis: { type: "array", items: { $ref: "#/components/schemas/InventoryKpi" } },
          currentInventory: { type: "array", items: { $ref: "#/components/schemas/PortInventoryRow" } },
          dispatch: { $ref: "#/components/schemas/DispatchSummary" },
          sales: { type: "array", items: { $ref: "#/components/schemas/SalesMonth" } },
          vesselsSailedOut: { type: "array", items: { $ref: "#/components/schemas/InventoryVesselRow" } },
          vesselsUnderloading: { type: "array", items: { $ref: "#/components/schemas/InventoryVesselRow" } },
        },
      },
    },
  },
} as const;

// Helper: 200 response that wraps a named schema in the ApiEnvelope.
function envelopeResponse(schemaName: string) {
  return {
    description: "OK",
    content: {
      "application/json": {
        schema: envelope({ $ref: `#/components/schemas/${schemaName}` }),
      },
    },
  };
}
