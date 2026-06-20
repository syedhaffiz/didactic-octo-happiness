Highcharts.chart("container", {
  chart: {
    type: "column",
    style: {
      fontFamily: "Helvetica, Arial, sans-serif",
    },
  },
  title: {
    text: "Shipper & Receiver Volumes by Port",
    style: {
      color: "#1B365D",
      fontWeight: "bold",
      fontSize: "18px",
    },
  },
  subtitle: {
    text: "Hover over any column block to see the specific Shippers and Receivers.",
    style: {
      color: "#555555",
    },
  },
  xAxis: {
    categories: [
      "MUNDRA",
      "KANDLA",
      "KRISHNAPATNAM",
      "DHAMRA",
      "VIZAG",
      "DAHEJ",
      "HAZIRA",
      "TUNA",
      "NAVLAKHI",
      "TUTICORIN",
    ],
    crosshair: true,
    labels: {
      style: {
        fontSize: "11px",
        fontWeight: "bold",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Volume (MT)",
    },
    stackLabels: {
      enabled: true,
      style: {
        fontWeight: "bold",
        color: "gray",
      },
      formatter: function () {
        if (this.total > 0) {
          return Highcharts.numberFormat(this.total / 1000, 0) + "K";
        }
      },
    },
  },
  tooltip: {
    useHTML: true,
    formatter: function () {
      let p = this.point;

      // Fix: Use this.key to explicitly grab the category name (Port Name) instead of the index
      let portName = this.key;

      // Build the custom HTML Tooltip
      let html = `<div style="font-family: Arial, sans-serif; font-size: 12px; min-width: 180px;">`;
      html += `<div style="font-size: 14px; font-weight: bold; color: #1B365D; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 5px;">
                        ${portName} <span style="font-size: 11px; color: #666;">(${this.series.userOptions.stack} Stack)</span>
                     </div>`;
      html += `<b>Segment:</b> <span style="color:${this.color}">■</span> ${this.series.name}<br/>`;
      html += `<b>Total Volume:</b> ${Highcharts.numberFormat(this.y, 0)} MT<br/>`;

      // Read the explicit shipper/receiver names we embedded in the data
      if (p.custom && p.custom.entities && p.custom.entities.length > 0) {
        html += `<div style="margin-top: 8px; background: #f4f6f9; padding: 6px; border-radius: 4px; border: 1px solid #eee;">`;
        html += `<b style="color:#333;">Key Entities Included:</b><br/>`;
        html += `<ul style="margin: 4px 0 0 0; padding-left: 15px; color:#444;">`;
        p.custom.entities.forEach((entity) => {
          html += `<li>${entity}</li>`;
        });
        html += `</ul></div>`;
      }
      html += `</div>`;

      return html;
    },
  },
  plotOptions: {
    column: {
      stacking: "normal",
      dataLabels: {
        enabled: false,
      },
    },
  },
  series: [
    // ==========================================
    // 1. ADANI - SHIPPERS (Dark Blue)
    // ==========================================
    {
      name: "Shipper Adani",
      stack: "Shipper",
      color: "#1B365D",
      data: [
        { y: 679970, custom: { entities: ["ADANI: 679K MT"] } }, // MUNDRA
        { y: 0, custom: { entities: [] } }, // KANDLA
        { y: 172411, custom: { entities: ["ADANI: 172K MT"] } }, // KRISHNAPATNAM
        { y: 192040, custom: { entities: ["ADANI: 192K MT"] } }, // DHAMRA
        { y: 0, custom: { entities: [] } }, // VIZAG
        { y: 368271, custom: { entities: ["ADANI: 368K MT"] } }, // DAHEJ
        { y: 300000, custom: { entities: ["ADANI: 300K MT"] } }, // HAZIRA
        { y: 203238, custom: { entities: ["ADANI: 203K MT"] } }, // TUNA
        { y: 135803, custom: { entities: ["ADANI: 135K MT"] } }, // NAVLAKHI
        { y: 80000, custom: { entities: ["ADANI: 80K MT"] } }, // TUTICORIN
      ],
    },
    // ==========================================
    // 2. NON-ADANI - SHIPPERS (Light Blue)
    // ==========================================
    {
      name: "Shipper Non-Adani",
      stack: "Shipper",
      color: "#A5C8ED",
      data: [
        { y: 325004, custom: { entities: ["SHREE CEMENT", "TATA POWER"] } },
        {
          y: 709668,
          custom: {
            entities: ["ULTRATECH CEMENT", "SHREE CEMENT", "AGARWAL COAL"],
          },
        },
        {
          y: 673415,
          custom: {
            entities: ["ULTRATECH CEMENT", "JSW STEEL", "MY HOME GROUP"],
          },
        },
        {
          y: 839219,
          custom: { entities: ["RUNGTA MINES", "RASHMI GROUP", "OCL IRON"] },
        },
        {
          y: 818241,
          custom: { entities: ["JSW STEEL", "MAHINDRA SPONGE", "JSPL"] },
        },
        {
          y: 296349,
          custom: { entities: ["GRASIM", "HINDUSTAN ZINC", "RELIANCE"] },
        },
        { y: 464700, custom: { entities: ["RELIANCE"] } },
        {
          y: 479834,
          custom: {
            entities: ["SWISS SINGAPORE", "WONDER CEMENT", "JSW TRADING"],
          },
        },
        {
          y: 439935,
          custom: {
            entities: ["AGARWAL COAL", "MOHIT MINERALS", "BHATIA COAL"],
          },
        },
        {
          y: 470384,
          custom: {
            entities: ["TATA INTERNATIONAL", "DHAR COAL", "AGARWAL COAL"],
          },
        },
      ],
    },
    // ==========================================
    // 3. ADANI - RECEIVERS (Teal/Medium Blue)
    // ==========================================
    {
      name: "Adani Receiver",
      stack: "Receiver",
      color: "#2E5B88",
      data: [
        { y: 1403215, custom: { entities: ["APL", "AEL SNS", "ACC/AMBUJA"] } },
        { y: 0, custom: { entities: [] } },
        { y: 172411, custom: { entities: ["AEL SNS"] } },
        { y: 192040, custom: { entities: ["AEL SNS"] } },
        { y: 0, custom: { entities: [] } },
        { y: 405509, custom: { entities: ["AEL SNS", "APL"] } },
        { y: 395615, custom: { entities: ["AEL SNS", "RELIANCE"] } },
        { y: 203238, custom: { entities: ["AEL SNS"] } },
        { y: 135803, custom: { entities: ["AEL SNS"] } },
        { y: 80000, custom: { entities: ["MOXIE POWER GEN"] } },
      ],
    },
    // ==========================================
    // 4. NON-ADANI - RECEIVERS (Grey)
    // ==========================================
    {
      name: "Non-Adani Receiver",
      stack: "Receiver",
      color: "#D0D0D0",
      data: [
        { y: 325004, custom: { entities: ["SHREE CEMENT", "TATA POWER"] } },
        {
          y: 709668,
          custom: {
            entities: ["ULTRATECH CEMENT", "KUTCH CHEMICALS", "JSW TRADING"],
          },
        },
        {
          y: 673415,
          custom: {
            entities: ["CHETTINAD CEMENT", "SEMBCORP", "JINDAL POWER"],
          },
        },
        {
          y: 839219,
          custom: { entities: ["RUNGTA MINES", "RASHMI GROUP", "OCL IRON"] },
        },
        {
          y: 818241,
          custom: { entities: ["JSW/BHUSHAN", "AMNS", "AGARWAL COAL"] },
        },
        {
          y: 296349,
          custom: { entities: ["GRASIM", "HINDALCO", "WONDER CEMENT"] },
        },
        { y: 464700, custom: { entities: ["RELIANCE"] } },
        {
          y: 479834,
          custom: {
            entities: ["SWISS SINGAPORE", "WONDER CEMENT", "COMSOL ENERGY"],
          },
        },
        {
          y: 439935,
          custom: { entities: ["FC AGARWAL", "AGARWAL COAL", "TARANJOT"] },
        },
        {
          y: 470384,
          custom: { entities: ["TATA INT.", "DHAR COAL", "NLC TAMILNADU"] },
        },
      ],
    },
  ],
});
