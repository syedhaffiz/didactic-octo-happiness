function getTooltipFormatter() {
   return function() {
       let point = this.point;
       let header = `<span style="font-size:14px; font-weight:bold; color:#1B365D;">${point.name}</span><br/><hr style="margin: 4px 0;"/>`;
​
       // Check if the custom data object exists, which it should for all levels
       if (!point.custom) {
           return `${header}<b>Volume:</b> ${Highcharts.numberFormat(point.y, 0)} MT`;
       }
​
       // Extract the absolute values for this specific entity (e.g., this specific Zone/Port)
       let adani_val = point.custom.adani || 0;
       let non_adani_val = point.custom.non_adani || 0;
​
       // Calculate the TRUE total for this entity
       let entity_total = adani_val + non_adani_val;
​
       // Calculate the true split percentages
       let adani_share = entity_total > 0 ? (adani_val / entity_total) * 100 : 0;
       let non_adani_share = entity_total > 0 ? (non_adani_val / entity_total) * 100 : 0;
​
       let table = `<table style="width:100%; border-collapse: collapse;">`;
       table += `<tr>
                     <td style="padding-right: 15px; color:#1B365D"><b>Adani Share:</b></td>
                     <td style="text-align: right;"><b>${adani_share.toFixed(1)}%</b> <span style="font-size: 10px; color:#666;">(${Highcharts.numberFormat(adani_val, 0)} MT)</span></td>
                 </tr>`;
       table += `<tr>
                     <td style="padding-right: 15px; color:#A5C8ED"><b>Others Share:</b></td>
                     <td style="text-align: right;"><b>${non_adani_share.toFixed(1)}%</b> <span style="font-size: 10px; color:#666;">(${Highcharts.numberFormat(non_adani_val, 0)} MT)</span></td>
                 </tr>`;
       table += `<tr style="border-top: 1px solid #ccc;">
                     <td style="padding-right: 15px; padding-top: 4px;"><b>Total Entity Volume:</b></td>
                     <td style="text-align: right; padding-top: 4px;"><b>${Highcharts.numberFormat(entity_total, 0)} MT</b></td>
                 </tr>`;
       table += `</table>`;
​
       return header + table;
   };
}
​
​
Highcharts.chart('container', {
   chart: {
       type: 'pie',
       style: {
           fontFamily: 'Helvetica, Arial, sans-serif'
       }
   },
   title: {
       text: 'Steam Coal Import Market Share Analysis',
       style: {
           color: '#1B365D',
           fontWeight: 'bold',
           fontSize: '18px'
       }
   },
   subtitle: {
       text: 'Click slices to drill down: Market → Zone → Port',
       style: {
           color: '#555555'
       }
   },
   accessibility: {
       announceNewData: {
           enabled: true
       }
   },
   plotOptions: {
       pie: {
           borderRadius: 5,
           dataLabels: [{
               enabled: true,
               distance: 15,
               format: '<b>{point.name}</b>'
           }, {
               enabled: true,
               backgroundColor: 'contrast',
               distance: '-30%',
               filter: {
                   property: 'percentage',
                   operator: '>',
                   value: 4
               },
               format: '{point.percentage:.1f}%',
               style: {
                   fontSize: '0.9em',
                   textOutline: 'none'
               }
           }],
           states: {
               inactive: {
                   opacity: 0.8
               }
           }
       }
   },
   tooltip: {
       useHTML: true,
       formatter: getTooltipFormatter()
   },
   
   // --- LEVEL 1: OVERALL MARKET ---
   series: [{"name": "Market Share", "colorByPoint": true, "colors": ["#1B365D", "#A5C8ED"], "data": [{"name": "Adani", "y": 2441994.686, "drilldown": "Adani", "custom": {"adani": 2441994.686, "non_adani": 7868778.2}}, {"name": "Non-Adani", "y": 7868778.2, "drilldown": "Non-Adani", "custom": {"adani": 2441994.686, "non_adani": 7868778.2}}]}],
​
   // --- ALL DRILLDOWN LEVELS ---
   drilldown: {
       activeDataLabelStyle: {
           color: '#ffffff',
           textDecoration: 'none',
           textOutline: '1px #333333'
       },
       breadcrumbs: {
           buttonTheme: {
               style: {
                   color: '#2E5B88',
                   fontWeight: 'bold'
               }
           }
       },
      series: [{"id": "Adani", "name": "Zone", "data": [{"name": "ZONE-1", "y": 883208.0, "drilldown": "Adani-ZONE-1", "custom": {"adani": 883208.0, "non_adani": 1419799.2}}, {"name": "ZONE-3", "y": 668271.0, "drilldown": "Adani-ZONE-3", "custom": {"adani": 668271.0, "non_adani": 1289197.0}}, {"name": "ZONE-8", "y": 278134.0, "drilldown": "Adani-ZONE-8", "custom": {"adani": 278134.0, "non_adani": 2042790.0}}, {"name": "ZONE-5", "y": 248882.0, "drilldown": "Adani-ZONE-5", "custom": {"adani": 248882.0, "non_adani": 732386.81}}, {"name": "ZONE-7", "y": 197000.0, "drilldown": "Adani-ZONE-7", "custom": {"adani": 197000.0, "non_adani": 857041.0}}, {"name": "ZONE-2", "y": 135803.0, "drilldown": "Adani-ZONE-2", "custom": {"adani": 135803.0, "non_adani": 706703.0}}, {"name": "ZONE-6", "y": 80000.0, "drilldown": "Adani-ZONE-6", "custom": {"adani": 80000.0, "non_adani": 792486.0}}, {"name": "ZONE-4", "y": 60500.0, "drilldown": "Adani-ZONE-4", "custom": {"adani": 60500.0, "non_adani": 768172.0}}]}, {"id": "Adani-ZONE-1", "name": "Port", "data": [{"name": "TUNA", "y": 203238.0, "drilldown": "Adani-ZONE-1-TUNA", "custom": {"adani": 203238.0, "non_adani": 479834.0}}, {"name": "MUNDRA", "y": 679970.0, "drilldown": "Adani-ZONE-1-MUNDRA", "custom": {"adani": 679970.0, "non_adani": 325004.686}}]}, {"id": "Adani-ZONE-3", "name": "Port", "data": [{"name": "HAZIRA", "y": 300000.0, "drilldown": "Adani-ZONE-3-HAZIRA", "custom": {"adani": 300000.0, "non_adani": 464700.0}}, {"name": "DAHEJ", "y": 368271.0, "drilldown": "Adani-ZONE-3-DAHEJ", "custom": {"adani": 368271.0, "non_adani": 296349.0}}]}, {"id": "Adani-ZONE-8", "name": "Port", "data": [{"name": "DHAMRA", "y": 192040.0, "drilldown": "Adani-ZONE-8-DHAMRA", "custom": {"adani": 192040.0, "non_adani": 839219.0}}, {"name": "HALDIA", "y": 86094.0, "drilldown": "Adani-ZONE-8-HALDIA", "custom": {"adani": 86094.0, "non_adani": 120003.0}}]}, {"id": "Adani-ZONE-5", "name": "Port", "data": [{"name": "KRISHNAPATNAM", "y": 172411.0, "drilldown": "Adani-ZONE-5-KRISHNAPATNAM", "custom": {"adani": 172411.0, "non_adani": 673415.81}}, {"name": "New Mangalore", "y": 76471.0, "drilldown": "Adani-ZONE-5-New Mangalore", "custom": {"adani": 76471.0, "non_adani": 174295.0}}]}, {"id": "Adani-ZONE-7", "name": "Port", "data": [{"name": "GANGAVARAM", "y": 197000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM", "custom": {"adani": 197000.0, "non_adani": 240500.0}}]}, {"id": "Adani-ZONE-2", "name": "Port", "data": [{"name": "NAVLAKHI", "y": 135803.0, "drilldown": "Adani-ZONE-2-NAVLAKHI", "custom": {"adani": 135803.0, "non_adani": 439935.0}}, {"name": "SANGHI", "y": 0, "drilldown": "Adani-ZONE-2-SANGHI", "custom": {"adani": 0, "non_adani": 0}}]}, {"id": "Adani-ZONE-6", "name": "Port", "data": [{"name": "TUTICORIN", "y": 80000.0, "drilldown": "Adani-ZONE-6-TUTICORIN", "custom": {"adani": 80000.0, "non_adani": 470384.0}}]}, {"id": "Adani-ZONE-4", "name": "Port", "data": [{"name": "DHARAMTAR", "y": 60500.0, "drilldown": "Adani-ZONE-4-DHARAMTAR", "custom": {"adani": 60500.0, "non_adani": 405911.0}}]}, {"id": "Adani-ZONE-1-TUNA", "name": "Shipper", "data": [{"name": "ADANI", "y": 203238.0, "drilldown": "Adani-ZONE-1-TUNA-ADANI", "custom": {"adani": 203238.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA", "name": "Shipper", "data": [{"name": "ADANI", "y": 679970.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI", "custom": {"adani": 679970.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA", "name": "Shipper", "data": [{"name": "ADANI", "y": 300000.0, "drilldown": "Adani-ZONE-3-HAZIRA-ADANI", "custom": {"adani": 300000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ", "name": "Shipper", "data": [{"name": "ADANI", "y": 368271.0, "drilldown": "Adani-ZONE-3-DAHEJ-ADANI", "custom": {"adani": 368271.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-DHAMRA", "name": "Shipper", "data": [{"name": "ADANI", "y": 192040.0, "drilldown": "Adani-ZONE-8-DHAMRA-ADANI", "custom": {"adani": 192040.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA", "name": "Shipper", "data": [{"name": "ADANI", "y": 86094.0, "drilldown": "Adani-ZONE-8-HALDIA-ADANI", "custom": {"adani": 86094.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-KRISHNAPATNAM", "name": "Shipper", "data": [{"name": "ADANI", "y": 172411.0, "drilldown": "Adani-ZONE-5-KRISHNAPATNAM-ADANI", "custom": {"adani": 172411.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-New Mangalore", "name": "Shipper", "data": [{"name": "ADANI", "y": 76471.0, "drilldown": "Adani-ZONE-5-New Mangalore-ADANI", "custom": {"adani": 76471.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM", "name": "Shipper", "data": [{"name": "ADANI", "y": 197000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM-ADANI", "custom": {"adani": 197000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-2-NAVLAKHI", "name": "Shipper", "data": [{"name": "ADANI", "y": 135803.0, "drilldown": "Adani-ZONE-2-NAVLAKHI-ADANI", "custom": {"adani": 135803.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-2-SANGHI", "name": "Shipper", "data": []}, {"id": "Adani-ZONE-6-TUTICORIN", "name": "Shipper", "data": [{"name": "ADANI", "y": 80000.0, "drilldown": "Adani-ZONE-6-TUTICORIN-ADANI", "custom": {"adani": 80000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-4-DHARAMTAR", "name": "Shipper", "data": [{"name": "ADANI", "y": 60500.0, "drilldown": "Adani-ZONE-4-DHARAMTAR-ADANI", "custom": {"adani": 60500.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-TUNA-ADANI", "name": "Receiver", "data": [{"name": "AEL SNS", "y": 203238.0, "drilldown": "Adani-ZONE-1-TUNA-ADANI-AEL SNS", "custom": {"adani": 203238.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI", "name": "Receiver", "data": [{"name": "APL", "y": 595000.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-APL", "custom": {"adani": 595000.0, "non_adani": 0}}, {"name": "ACC / AMBUJA CEMENTS", "y": 33650.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-ACC / AMBUJA CEMENTS", "custom": {"adani": 33650.0, "non_adani": 0}}, {"name": "AEL SNS", "y": 51320.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-AEL SNS", "custom": {"adani": 51320.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA-ADANI", "name": "Receiver", "data": [{"name": "RELIANCE", "y": 110000.0, "drilldown": "Adani-ZONE-3-HAZIRA-ADANI-RELIANCE", "custom": {"adani": 110000.0, "non_adani": 0}}, {"name": "AEL SNS", "y": 190000.0, "drilldown": "Adani-ZONE-3-HAZIRA-ADANI-AEL SNS", "custom": {"adani": 190000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ-ADANI", "name": "Receiver", "data": [{"name": "APL", "y": 75230.0, "drilldown": "Adani-ZONE-3-DAHEJ-ADANI-APL", "custom": {"adani": 75230.0, "non_adani": 0}}, {"name": "AEL SNS", "y": 293041.0, "drilldown": "Adani-ZONE-3-DAHEJ-ADANI-AEL SNS", "custom": {"adani": 293041.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-DHAMRA-ADANI", "name": "Receiver", "data": [{"name": "AEL SNS", "y": 192040.0, "drilldown": "Adani-ZONE-8-DHAMRA-ADANI-AEL SNS", "custom": {"adani": 192040.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA-ADANI", "name": "Receiver", "data": [{"name": "HALDIA PETROCHEMICALS LTD", "y": 30000.0, "drilldown": "Adani-ZONE-8-HALDIA-ADANI-HALDIA PETROCHEMICALS LTD", "custom": {"adani": 30000.0, "non_adani": 0}}, {"name": "AEL SNS", "y": 56094.0, "drilldown": "Adani-ZONE-8-HALDIA-ADANI-AEL SNS", "custom": {"adani": 56094.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-KRISHNAPATNAM-ADANI", "name": "Receiver", "data": [{"name": "AEL SNS", "y": 172411.0, "drilldown": "Adani-ZONE-5-KRISHNAPATNAM-ADANI-AEL SNS", "custom": {"adani": 172411.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-New Mangalore-ADANI", "name": "Receiver", "data": [{"name": "UDUPI POWER", "y": 76471.0, "drilldown": "Adani-ZONE-5-New Mangalore-ADANI-UDUPI POWER", "custom": {"adani": 76471.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM-ADANI", "name": "Receiver", "data": [{"name": "SEB", "y": 75000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM-ADANI-SEB", "custom": {"adani": 75000.0, "non_adani": 0}}, {"name": "AEL SNS", "y": 122000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM-ADANI-AEL SNS", "custom": {"adani": 122000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-2-NAVLAKHI-ADANI", "name": "Receiver", "data": [{"name": "AEL SNS", "y": 135803.0, "drilldown": "Adani-ZONE-2-NAVLAKHI-ADANI-AEL SNS", "custom": {"adani": 135803.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-6-TUTICORIN-ADANI", "name": "Receiver", "data": [{"name": "MOXIE POWER GENERATION LTD", "y": 80000.0, "drilldown": "Adani-ZONE-6-TUTICORIN-ADANI-MOXIE POWER GENERATION LTD", "custom": {"adani": 80000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-4-DHARAMTAR-ADANI", "name": "Receiver", "data": [{"name": "AEL SNS", "y": 60500.0, "drilldown": "Adani-ZONE-4-DHARAMTAR-ADANI-AEL SNS", "custom": {"adani": 60500.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-TUNA-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 203238.0, "drilldown": "Adani-ZONE-1-TUNA-ADANI-AEL SNS-ADANI", "custom": {"adani": 203238.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-APL", "name": "Trader", "data": [{"name": "ADANI", "y": 595000.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-APL-ADANI", "custom": {"adani": 595000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-ACC / AMBUJA CEMENTS", "name": "Trader", "data": [{"name": "ADANI", "y": 33650.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-ACC / AMBUJA CEMENTS-ADANI", "custom": {"adani": 33650.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 51320.0, "drilldown": "Adani-ZONE-1-MUNDRA-ADANI-AEL SNS-ADANI", "custom": {"adani": 51320.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA-ADANI-RELIANCE", "name": "Trader", "data": [{"name": "ADANI", "y": 110000.0, "drilldown": "Adani-ZONE-3-HAZIRA-ADANI-RELIANCE-ADANI", "custom": {"adani": 110000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 190000.0, "drilldown": "Adani-ZONE-3-HAZIRA-ADANI-AEL SNS-ADANI", "custom": {"adani": 190000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ-ADANI-APL", "name": "Trader", "data": [{"name": "ADANI", "y": 75230.0, "drilldown": "Adani-ZONE-3-DAHEJ-ADANI-APL-ADANI", "custom": {"adani": 75230.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 293041.0, "drilldown": "Adani-ZONE-3-DAHEJ-ADANI-AEL SNS-ADANI", "custom": {"adani": 293041.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-DHAMRA-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 192040.0, "drilldown": "Adani-ZONE-8-DHAMRA-ADANI-AEL SNS-ADANI", "custom": {"adani": 192040.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA-ADANI-HALDIA PETROCHEMICALS LTD", "name": "Trader", "data": [{"name": "ADANI", "y": 30000.0, "drilldown": "Adani-ZONE-8-HALDIA-ADANI-HALDIA PETROCHEMICALS LTD-ADANI", "custom": {"adani": 30000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 56094.0, "drilldown": "Adani-ZONE-8-HALDIA-ADANI-AEL SNS-ADANI", "custom": {"adani": 56094.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-KRISHNAPATNAM-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 172411.0, "drilldown": "Adani-ZONE-5-KRISHNAPATNAM-ADANI-AEL SNS-ADANI", "custom": {"adani": 172411.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-New Mangalore-ADANI-UDUPI POWER", "name": "Trader", "data": [{"name": "ADANI", "y": 76471.0, "drilldown": "Adani-ZONE-5-New Mangalore-ADANI-UDUPI POWER-ADANI", "custom": {"adani": 76471.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM-ADANI-SEB", "name": "Trader", "data": [{"name": "ADANI", "y": 75000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM-ADANI-SEB-ADANI", "custom": {"adani": 75000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 122000.0, "drilldown": "Adani-ZONE-7-GANGAVARAM-ADANI-AEL SNS-ADANI", "custom": {"adani": 122000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-2-NAVLAKHI-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 135803.0, "drilldown": "Adani-ZONE-2-NAVLAKHI-ADANI-AEL SNS-ADANI", "custom": {"adani": 135803.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-6-TUTICORIN-ADANI-MOXIE POWER GENERATION LTD", "name": "Trader", "data": [{"name": "ADANI", "y": 80000.0, "drilldown": "Adani-ZONE-6-TUTICORIN-ADANI-MOXIE POWER GENERATION LTD-ADANI", "custom": {"adani": 80000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-4-DHARAMTAR-ADANI-AEL SNS", "name": "Trader", "data": [{"name": "ADANI", "y": 60500.0, "drilldown": "Adani-ZONE-4-DHARAMTAR-ADANI-AEL SNS-ADANI", "custom": {"adani": 60500.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-TUNA-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "USA", "y": 203238.0, "drilldown": null, "custom": {"adani": 203238.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-APL-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 595000.0, "drilldown": null, "custom": {"adani": 595000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-ACC / AMBUJA CEMENTS-ADANI", "name": "Origin", "data": [{"name": "MOZAMBIQUE", "y": 33650.0, "drilldown": null, "custom": {"adani": 33650.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-1-MUNDRA-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 51320.0, "drilldown": null, "custom": {"adani": 51320.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA-ADANI-RELIANCE-ADANI", "name": "Origin", "data": [{"name": "AUST", "y": 110000.0, "drilldown": null, "custom": {"adani": 110000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-HAZIRA-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 190000.0, "drilldown": null, "custom": {"adani": 190000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ-ADANI-APL-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 75230.0, "drilldown": null, "custom": {"adani": 75230.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-3-DAHEJ-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 293041.0, "drilldown": null, "custom": {"adani": 293041.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-DHAMRA-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "RSA", "y": 192040.0, "drilldown": null, "custom": {"adani": 192040.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA-ADANI-HALDIA PETROCHEMICALS LTD-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 30000.0, "drilldown": null, "custom": {"adani": 30000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-8-HALDIA-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 56094.0, "drilldown": null, "custom": {"adani": 56094.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-KRISHNAPATNAM-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "RSA", "y": 116907.0, "drilldown": null, "custom": {"adani": 116907.0, "non_adani": 0}}, {"name": "INDO", "y": 55504.0, "drilldown": null, "custom": {"adani": 55504.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-5-New Mangalore-ADANI-UDUPI POWER-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 76471.0, "drilldown": null, "custom": {"adani": 76471.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM-ADANI-SEB-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 75000.0, "drilldown": null, "custom": {"adani": 75000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-7-GANGAVARAM-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "RSA", "y": 46121.0, "drilldown": null, "custom": {"adani": 46121.0, "non_adani": 0}}, {"name": "INDO", "y": 75879.0, "drilldown": null, "custom": {"adani": 75879.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-2-NAVLAKHI-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 135803.0, "drilldown": null, "custom": {"adani": 135803.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-6-TUTICORIN-ADANI-MOXIE POWER GENERATION LTD-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 80000.0, "drilldown": null, "custom": {"adani": 80000.0, "non_adani": 0}}]}, {"id": "Adani-ZONE-4-DHARAMTAR-ADANI-AEL SNS-ADANI", "name": "Origin", "data": [{"name": "INDO", "y": 60500.0, "drilldown": null, "custom": {"adani": 60500.0, "non_adani": 0}}]}]
   }
});
