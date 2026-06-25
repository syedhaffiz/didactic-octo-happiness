// OpenAPI 3.0 specification for the IRM backend.
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
    title: "IRM API",
    version: "0.1.0",
    description:
      "Backend for the IRM (Integrated Resource Management) dashboard. All endpoints return an " +
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
    { name: "Marketing" },
    { name: "Legal" },
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
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("OverviewResponse") },
      },
    },
    "/finance/kpis": {
      get: {
        tags: ["Finance"],
        summary: "Just the KPI cards (subset of /finance/overview)",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
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
        summary: "Revenue breakdown (cards + donut, YTD/MTD)",
        parameters: [
          {
            name: "period",
            in: "query",
            schema: { type: "string", enum: ["YTD", "MTD"] },
            description: "Defaults to `YTD`.",
          },
        ],
        responses: { "200": envelopeResponse("RevenueBreakdownResponse") },
      },
    },
    "/finance/revenue/port": {
      get: {
        tags: ["Finance"],
        summary: "Revenue ledger by port",
        parameters: [{ $ref: "#/components/parameters/Port" }],
        responses: { "200": envelopeResponse("RevenuePortResponse") },
      },
    },
    "/finance/revenue/segment": {
      get: {
        tags: ["Finance"],
        summary: "Revenue ledger by segment",
        parameters: [
          {
            name: "segment",
            in: "query",
            schema: { type: "string" },
            description: "Segment id (omit for all).",
          },
        ],
        responses: { "200": envelopeResponse("RevenueSegmentResponse") },
      },
    },
    "/finance/working-capital": {
      get: {
        tags: ["Finance"],
        summary: "Working capital breakdown",
        parameters: [
          { $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" },
          { $ref: "#/components/parameters/Port" },
        ],
        responses: { "200": envelopeResponse("BreakdownResponse") },
      },
    },
    "/finance/profitability": {
      get: {
        tags: ["Finance"],
        summary: "Net Margin Profitability — port bars + total + segment treemap",
        parameters: [
          { $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" },
          { $ref: "#/components/parameters/Port" },
          {
            name: "currency",
            in: "query",
            schema: { type: "string", enum: ["INR", "USD"] },
            description: "Defaults to `INR`. Affects the Port-Wise chart values.",
          },
        ],
        responses: { "200": envelopeResponse("NetMarginProfitabilityResponse") },
      },
    },
    "/finance/profitability/vessels/sales": {
      get: {
        tags: ["Finance"],
        summary: "Vessel Profitability — Sales tab table",
        parameters: [
          { $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" },
          { $ref: "#/components/parameters/Port" },
        ],
        responses: { "200": envelopeResponse("VesselSalesResponse") },
      },
    },
    "/finance/profitability/vessels/handling": {
      get: {
        tags: ["Finance"],
        summary: "Vessel Profitability — Handling tab table",
        parameters: [
          { $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" },
          { $ref: "#/components/parameters/Port" },
        ],
        responses: { "200": envelopeResponse("VesselHandlingResponse") },
      },
    },
    "/finance/profitability/vessels/sales/{batchId}": {
      get: {
        tags: ["Finance"],
        summary: "Sales batch detail (drilldown from vessel table row)",
        parameters: [
          {
            name: "batchId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "URL-encoded batch id, e.g. `125260503A`",
          },
        ],
        responses: { "200": envelopeResponse("SalesBatchDetailResponse") },
      },
    },
    "/finance/profitability/vessels/handling/{batchId}": {
      get: {
        tags: ["Finance"],
        summary: "Handling batch detail (drilldown from vessel table row)",
        parameters: [
          {
            name: "batchId",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "URL-encoded batch id, e.g. `125260503A`",
          },
        ],
        responses: { "200": envelopeResponse("HandlingBatchDetailResponse") },
      },
    },
    "/finance/sales": {
      get: {
        tags: ["Finance"],
        summary: "Budget-vs-actual sales by port / zone / segment",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
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
        summary: "Inventory KPIs, port stock, dispatch, sales",
        description:
          "Vessels are no longer part of this payload — see " +
          "`/inventory/vessels/sailed-out` and `/inventory/vessels/under-loading`.",
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
    "/inventory/vessels/sailed-out": {
      get: {
        tags: ["Inventory"],
        summary: "Vessels that have sailed out, filtered",
        description: "Same filters as /inventory/overview.",
        parameters: [
          { $ref: "#/components/parameters/Port" },
          { name: "origin", in: "query", schema: { type: "string" } },
          { name: "grade", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": envelopeResponse("VesselsResponse") },
      },
    },
    "/inventory/vessels/under-loading": {
      get: {
        tags: ["Inventory"],
        summary: "Vessels currently under-loading at a port, filtered",
        description: "Same filters as /inventory/overview.",
        parameters: [
          { $ref: "#/components/parameters/Port" },
          { name: "origin", in: "query", schema: { type: "string" } },
          { name: "grade", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": envelopeResponse("VesselsResponse") },
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

    // --- Marketing --------------------------------------------------------
    "/marketing/indices": {
      get: {
        tags: ["Marketing"],
        summary: "Index Movement — ICI + API (daily & weekly) multi-series charts",
        description: "Bulk endpoint. For per-card range filters use `GET /marketing/indices/{code}`.",
        parameters: [
          {
            name: "range",
            in: "query",
            schema: { type: "string", enum: ["1", "2"] },
            description: "Months to plot. Defaults to `1`.",
          },
        ],
        responses: { "200": envelopeResponse("IndexMovementResponse") },
      },
    },
    "/marketing/indices/{code}": {
      get: {
        tags: ["Marketing"],
        summary: "Single Index Movement chart with its own range",
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Card slug: `ici`, `api-daily`, or `api-weekly`.",
          },
          {
            name: "range",
            in: "query",
            schema: { type: "string", enum: ["1", "2"] },
            description: "Months to plot. Defaults to `1`.",
          },
        ],
        responses: {
          "200": envelopeResponse("IndexChart"),
          "404": {
            description: "Unknown code",
            content: {
              "application/json": { schema: envelope({ $ref: "#/components/schemas/ApiError" }) },
            },
          },
        },
      },
    },
    "/marketing/market-share": {
      get: {
        tags: ["Marketing"],
        summary: "Market share — root pies (Own/Non-Own) + shipper/receiver bars",
        description: "Returns only the root level of each pie. Deeper levels are fetched on demand via `/marketing/market-share/drill`.",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("MarketShareResponse") },
      },
    },
    "/marketing/market-share/drill": {
      get: {
        tags: ["Marketing"],
        summary: "One lazily-loaded Market Share drilldown level",
        parameters: [
          {
            name: "dim",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["geographic", "businessType"] },
            description: "Which pie to drill: geographic (Zone→Port) or businessType (Port→Business Type).",
          },
          {
            name: "path",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Drilldown node id from the clicked point (e.g. `geo-own`, `geo-zone-1`, `business-mundra`).",
          },
        ],
        responses: {
          "200": envelopeResponse("MarketShareDrilldownSeries"),
          "404": {
            description: "Unknown path",
            content: {
              "application/json": { schema: envelope({ $ref: "#/components/schemas/ApiError" }) },
            },
          },
        },
      },
    },
    "/marketing/ocean-freight": {
      get: {
        tags: ["Marketing"],
        summary: "M2M Ocean Freight — Capes & Panamax line charts",
        parameters: [
          {
            name: "dischargePort",
            in: "query",
            schema: { type: "string" },
            description: "Discharge port name; defaults to `Hazira`",
          },
          { $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" },
        ],
        responses: { "200": envelopeResponse("OceanFreightResponse") },
      },
    },
    "/marketing/target": {
      get: {
        tags: ["Marketing"],
        summary: "Target above 2% — port-wise, origin-wise, segment-wise",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("TargetResponse") },
      },
    },

    // --- Legal ------------------------------------------------------------
    "/legal/summary": {
      get: {
        tags: ["Legal"],
        summary: "Counts for the Legal Case / Critical Issue summary cards",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("LegalSummary") },
      },
    },
    "/legal/critical-cases": {
      get: {
        tags: ["Legal"],
        summary: "Critical cases list (table on the Critical Cases page)",
        description:
          "Each row carries the modal-only fields (briefFacts, currentStatus, …) " +
          "so the Details modal renders directly from the row data — no per-case fetch.",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("CriticalCasesResponse") },
      },
    },
    "/legal/critical-issues": {
      get: {
        tags: ["Legal"],
        summary: "Pre-litigation legal issues",
        parameters: [{ $ref: "#/components/parameters/FromDate" }, { $ref: "#/components/parameters/ToDate" }],
        responses: { "200": envelopeResponse("CriticalIssuesResponse") },
      },
    },
  },

  components: {
    parameters: {
      FromDate: {
        name: "fromDate",
        in: "query",
        schema: { type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        description: "Range start as `YYYY-MM-DD`. Omit (with toDate) for the default window.",
      },
      ToDate: {
        name: "toDate",
        in: "query",
        schema: { type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        description: "Range end as `YYYY-MM-DD`. Omit (with fromDate) for the default window.",
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
        required: ["id", "label", "value", "unit", "deltaPct", "trend", "spark"],
        properties: {
          id: {
            type: "string",
            enum: ["revenue", "sales", "profitability", "workingCapital", "inventoryDays"],
          },
          label: { type: "string" },
          value: { type: "number" },
          unit: { type: "string", enum: ["Cr", "MMT", "Days"] },
          deltaPct: { type: "number" },
          trend: { type: "string", enum: ["up", "down"] },
          spark: { type: "array", items: { type: "number" } },
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

      // --- Finance: Revenue suite --------------------------------------
      RevenueBreakdownCard: {
        type: "object",
        required: ["segment", "value", "unit", "color"],
        properties: {
          segment: { type: "string" },
          value: { type: "number" },
          unit: { type: "string", enum: ["Cr"] },
          color: { type: "string", description: "Hex color matching the donut slice." },
        },
      },
      RevenueBreakdownResponse: {
        type: "object",
        required: ["period", "total", "unit", "cards", "slices"],
        properties: {
          period: { type: "string", enum: ["YTD", "MTD"] },
          total: { type: "number" },
          unit: { type: "string", enum: ["Cr"] },
          cards: { type: "array", items: { $ref: "#/components/schemas/RevenueBreakdownCard" } },
          slices: { type: "array", items: { $ref: "#/components/schemas/DonutSlice" } },
        },
      },
      RevenuePortRow: {
        type: "object",
        required: ["port", "companyCode", "accountNumber", "profitCentre", "accumulatedBalance"],
        properties: {
          port: { type: "string" },
          companyCode: { type: "string" },
          accountNumber: { type: "string" },
          profitCentre: { type: "string" },
          accumulatedBalance: { type: "number" },
        },
      },
      RevenuePortResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/RevenuePortRow" } },
        },
      },
      RevenueSegmentRow: {
        type: "object",
        required: ["segment", "companyCode", "accountNumber", "profitCentre", "accumulatedBalance"],
        properties: {
          segment: { type: "string" },
          companyCode: { type: "string" },
          accountNumber: { type: "string" },
          profitCentre: { type: "string" },
          accumulatedBalance: { type: "number" },
        },
      },
      RevenueSegmentResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/RevenueSegmentRow" } },
        },
      },

      // --- Finance: Profitability suite --------------------------------
      PortBar: {
        type: "object",
        required: ["port", "value"],
        properties: {
          port: { type: "string" },
          value: { type: "number" },
        },
      },
      SegmentSlice: {
        type: "object",
        required: ["segment", "value"],
        properties: {
          segment: { type: "string" },
          value: { type: "number" },
        },
      },
      NetMarginProfitabilityResponse: {
        type: "object",
        required: ["total", "portwise", "segmentwise"],
        properties: {
          total: {
            type: "object",
            required: ["value", "unit", "deltaPct", "trend"],
            properties: {
              value: { type: "number" },
              unit: { type: "string", example: "Cr" },
              deltaPct: { type: "number" },
              trend: { type: "string", enum: ["up", "down"] },
            },
          },
          portwise: {
            type: "object",
            required: ["currency", "rows"],
            properties: {
              currency: { type: "string", enum: ["INR", "USD"] },
              rows: { type: "array", items: { $ref: "#/components/schemas/PortBar" } },
            },
          },
          segmentwise: { type: "array", items: { $ref: "#/components/schemas/SegmentSlice" } },
        },
      },
      VesselSalesRow: {
        type: "object",
        required: ["batchId", "vessel", "segment", "volume", "profit", "pmtProfit"],
        properties: {
          batchId: { type: "string" },
          vessel: { type: "string" },
          segment: { type: "string" },
          volume: { type: "number" },
          profit: { type: "number" },
          pmtProfit: { type: "number" },
        },
      },
      VesselSalesResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/VesselSalesRow" } },
        },
      },
      VesselHandlingRow: {
        type: "object",
        required: ["batchId", "vessel", "grade", "origin", "port", "segment", "volume", "profit", "pmtProfit"],
        properties: {
          batchId: { type: "string" },
          vessel: { type: "string" },
          grade: { type: "string" },
          origin: { type: "string" },
          port: { type: "string" },
          segment: { type: "string" },
          volume: { type: "number" },
          profit: { type: "number" },
          pmtProfit: { type: "number" },
        },
      },
      VesselHandlingResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/VesselHandlingRow" } },
        },
      },
      SalesBatchDetailRow: {
        type: "object",
        required: ["batchId", "customerName", "plantName", "tradeContractNo", "billAmount", "billQuantity", "cogsValue"],
        properties: {
          batchId: { type: "string" },
          customerName: { type: "string" },
          plantName: { type: "string" },
          tradeContractNo: { type: "string" },
          billAmount: { type: "number" },
          billQuantity: { type: "number" },
          cogsValue: { type: "number" },
        },
      },
      SalesBatchDetailResponse: {
        type: "object",
        required: ["batchId", "items"],
        properties: {
          batchId: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/SalesBatchDetailRow" } },
        },
      },
      HandlingBatchDetailRow: {
        type: "object",
        required: ["batchId", "customerName", "plantName", "tradeContractNo", "tphCifCoalHandlingQty", "tphCoalHandlingQty", "sagarmalaHandlingCalculatedQty", "sagarmalaHandlingPostedQty"],
        properties: {
          batchId: { type: "string" },
          customerName: { type: "string" },
          plantName: { type: "string" },
          tradeContractNo: { type: "string" },
          tphCifCoalHandlingQty: { type: "number" },
          tphCoalHandlingQty: { type: "number" },
          sagarmalaHandlingCalculatedQty: { type: "number" },
          sagarmalaHandlingPostedQty: { type: "number" },
        },
      },
      HandlingBatchDetailResponse: {
        type: "object",
        required: ["batchId", "items"],
        properties: {
          batchId: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/HandlingBatchDetailRow" } },
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
        required: ["items"],
        properties: {
          items: {
            type: "object",
            required: ["asOf", "kpis", "currentInventory", "dispatch", "sales"],
            properties: {
              asOf: { type: "string", format: "date" },
              kpis: { type: "array", items: { $ref: "#/components/schemas/InventoryKpi" } },
              currentInventory: {
                type: "array",
                items: { $ref: "#/components/schemas/PortInventoryRow" },
              },
              dispatch: { $ref: "#/components/schemas/DispatchSummary" },
              sales: { type: "array", items: { $ref: "#/components/schemas/SalesMonth" } },
            },
          },
        },
      },
      VesselsResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/InventoryVesselRow" },
          },
        },
      },

      // --- Marketing ------------------------------------------------------
      IndexSeries: {
        type: "object",
        required: ["name", "data"],
        properties: {
          name: { type: "string", example: "ICI 1" },
          data: { type: "array", items: { type: "number" } },
        },
      },
      IndexChart: {
        type: "object",
        required: ["code", "title", "cadence", "range", "categories", "series"],
        properties: {
          code: { type: "string", example: "ici" },
          title: { type: "string", example: "ICI Index" },
          cadence: { type: "string", enum: ["daily", "weekly"] },
          range: { type: "string", enum: ["1", "2"] },
          categories: { type: "array", items: { type: "string" } },
          series: { type: "array", items: { $ref: "#/components/schemas/IndexSeries" } },
        },
      },
      IndexMovementResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/IndexChart" } },
        },
      },
      MarketSharePiePoint: {
        type: "object",
        required: ["name", "y", "drilldown", "own", "nonOwn"],
        properties: {
          name: { type: "string" },
          y: { type: "number" },
          drilldown: { type: "string", nullable: true },
          own: { type: "number" },
          nonOwn: { type: "number" },
        },
      },
      MarketShareDrilldownSeries: {
        type: "object",
        required: ["id", "tier", "data"],
        properties: {
          id: { type: "string" },
          tier: { type: "string", example: "Zone" },
          data: { type: "array", items: { $ref: "#/components/schemas/MarketSharePiePoint" } },
        },
      },
      MarketShareRootPie: {
        type: "object",
        required: ["rootName", "root"],
        properties: {
          rootName: { type: "string", example: "Market Share" },
          root: { type: "array", items: { $ref: "#/components/schemas/MarketSharePiePoint" } },
        },
      },
      ShipperReceiverRow: {
        type: "object",
        required: ["port", "shipperOwn", "shipperNonOwn", "receiverOwn", "receiverNonOwn"],
        properties: {
          port: { type: "string" },
          shipperOwn: { type: "number" },
          shipperNonOwn: { type: "number" },
          receiverOwn: { type: "number" },
          receiverNonOwn: { type: "number" },
        },
      },
      MarketShareResponse: {
        type: "object",
        required: ["unit", "geographic", "businessType", "shipperReceiver"],
        properties: {
          unit: { type: "string", example: "MT" },
          geographic: { $ref: "#/components/schemas/MarketShareDrilldownPie" },
          businessType: { $ref: "#/components/schemas/MarketShareDrilldownPie" },
          shipperReceiver: {
            type: "array",
            items: { $ref: "#/components/schemas/ShipperReceiverRow" },
          },
        },
      },
      FreightSeries: {
        type: "object",
        required: ["name", "data"],
        properties: {
          name: { type: "string", example: "Samarinda" },
          data: { type: "array", items: { type: "number" } },
        },
      },
      FreightChart: {
        type: "object",
        required: ["vesselType", "unit", "categories", "series"],
        properties: {
          vesselType: { type: "string", example: "Capes" },
          unit: { type: "string", example: "$/MT" },
          categories: { type: "array", items: { type: "string" } },
          series: { type: "array", items: { $ref: "#/components/schemas/FreightSeries" } },
        },
      },
      OceanFreightResponse: {
        type: "object",
        required: ["dischargePort", "items"],
        properties: {
          dischargePort: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/FreightChart" } },
        },
      },
      BarRow: {
        type: "object",
        required: ["category", "value"],
        properties: { category: { type: "string" }, value: { type: "number" } },
      },
      MktBudgetActualRow: {
        type: "object",
        required: ["category", "budget", "actual"],
        properties: {
          category: { type: "string" },
          budget: { type: "number" },
          actual: { type: "number" },
        },
      },
      TargetResponse: {
        type: "object",
        required: ["unit", "portwise", "originwise", "segmentwise"],
        properties: {
          unit: { type: "string", example: "MT" },
          portwise: { type: "array", items: { $ref: "#/components/schemas/BarRow" } },
          originwise: { type: "array", items: { $ref: "#/components/schemas/MktBudgetActualRow" } },
          segmentwise: { type: "array", items: { $ref: "#/components/schemas/MktBudgetActualRow" } },
        },
      },

      // --- Legal ----------------------------------------------------------
      LegalSummary: {
        type: "object",
        required: ["newCases", "totalCases", "newIssues", "totalIssues"],
        properties: {
          newCases: { type: "integer" },
          totalCases: { type: "integer" },
          newIssues: { type: "integer" },
          totalIssues: { type: "integer" },
        },
      },
      CriticalCase: {
        type: "object",
        required: [
          "srNo",
          "caseNo",
          "category",
          "claimant",
          "defendant",
          "forum",
          "claim",
          "costIncurred",
          "lawyer",
          "lastDate",
          "nextDate",
          "caseType",
          "title",
          "briefFacts",
          "currentStatus",
        ],
        properties: {
          srNo: { type: "integer" },
          caseNo: { type: "string", example: "EC/103/2022" },
          category: { type: "string", example: "SEB" },
          claimant: { type: "string" },
          defendant: { type: "string" },
          forum: { type: "string" },
          claim: { type: "string", example: "Rs. 25 Cr. Approx + Interest" },
          costIncurred: { type: "string", example: "2.57Cr" },
          lawyer: { type: "string" },
          lastDate: { type: "string", example: "07.05.2026" },
          nextDate: { type: "string", example: "Awaited" },
          caseType: { type: "string", example: "Arbitration" },
          title: { type: "string", example: "WBPDCL vs. AEL" },
          briefFacts: { type: "string" },
          currentStatus: { type: "string" },
        },
      },
      CriticalCasesResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/CriticalCase" } },
        },
      },
      CriticalIssue: {
        type: "object",
        required: ["srNo", "legalIssue", "amountInvolved", "currentStatus"],
        properties: {
          srNo: { type: "integer" },
          legalIssue: { type: "string" },
          amountInvolved: { type: "string", example: "NA" },
          currentStatus: { type: "string" },
        },
      },
      CriticalIssuesResponse: {
        type: "object",
        required: ["items"],
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/CriticalIssue" } },
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
