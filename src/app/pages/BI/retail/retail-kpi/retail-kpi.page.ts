import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ReportService } from 'src/app/services/report.service';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

@Component({
  selector: 'app-retail-kpi',
  templateUrl: './retail-kpi.page.html',
  styleUrls: ['./retail-kpi.page.scss'],
})
export class RetailKpiPage extends PageBase {

  constructor(
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
    public rpt: ReportService,
  ) {
    super();
  }

  ionViewDidEnter() {
    this.buildRateOfReturnChart();
    this.buildCustomerRetentionChart();
    this.buildRateOfReturnCatergoryChart();
    this.buildNumberOfCustomerChart();
  }

  async buildRateOfReturnChart() {
    //-----------Gauge-Chart
    console.log('buildRateOfReturnChart');
    // await amGaugeRoot?.dispose();

    var amGaugeRoot = this.rpt.newGaugeRoot("RateOfReturnChart");
    // this.charts.RateOfReturnChart.Chart = amGaugeRoot;

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    amGaugeRoot.setThemes([am5themes_Animated.new(amGaugeRoot)]);


    // Create Chart
    // https://www.amcharts.com/docs/v5/charts/radar-chart/
    let chart = amGaugeRoot.container.children.push(am5radar.RadarChart.new(amGaugeRoot, this.rpt.AmChartGlobal.gaugeOpt.Chart));


    // Create axis and its renderer
    // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Axes
    let axisRenderer = am5radar.AxisRendererCircular.new(amGaugeRoot, this.rpt.AmChartGlobal.gaugeOpt.AxisRenderer);

    axisRenderer.grid.template.setAll({
      stroke: amGaugeRoot.interfaceColors.get("background"),
      visible: true,
      strokeOpacity: 0.8
    });

    let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(amGaugeRoot, {
      maxDeviation: 0,
      min: 0,
      max: 100,
      strictMinMax: true,
      renderer: axisRenderer
    }));

    // Add clock hand
    // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Clock_hands
    let axisDataItem = xAxis.makeDataItem({});

    let clockHand = am5radar.ClockHand.new(amGaugeRoot, this.rpt.AmChartGlobal.gaugeOpt.ClockHand)

    let bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(amGaugeRoot, {
      sprite: clockHand
    }));

    xAxis.createAxisRange(axisDataItem);

    //Add Label
    let label = chart.radarContainer.children.push(am5.Label.new(amGaugeRoot, this.rpt.AmChartGlobal.gaugeOpt.Label));

    axisDataItem.set("value", 50);
    bullet.get("sprite").on("rotation", function () {
      let value = axisDataItem.get("value");
      let text = Math.round(axisDataItem.get("value")).toString();
      let fill = am5.color(0x000000);
      xAxis.axisRanges.each(function (axisRange) {
        if (value >= axisRange.get("value") && value <= axisRange.get("endValue")) {
          fill = axisRange.get("axisFill").get("fill");
        }
      })

      label.set("text", Math.round(value).toString());

      clockHand.pin.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
      clockHand.hand.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
    });

    /// Set Gauge Hand To Change
    // setInterval(function () {
    //   axisDataItem.animate({
    //     key: "value",
    //     to: Math.round(Math.random() * 140 - 40),
    //     duration: 500,
    //     easing: am5.ease.out(am5.ease.cubic)
    //   });
    // }, 2000)

    chart.bulletsContainer.set("mask", undefined);


    // Create axis ranges bands
    // https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Bands
    let bandsData = [{
      title: "Low",
      color: "#ee1f25",
      lowScore: 0,
      highScore: 33
    }, {
      title: "Medium",
      color: "#f04922",
      lowScore: 34,
      highScore: 66
    }, {
      title: "High",
      color: "#fdae19",
      lowScore: 67,
      highScore: 100
    }];

    am5.array.each(bandsData, function (data) {
      let axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

      axisRange.setAll({
        value: data.lowScore,
        endValue: data.highScore
      });

      axisRange.get("axisFill").setAll({
        visible: true,
        fill: am5.color(data.color),
        fillOpacity: 0.8
      });

      axisRange.get("label").setAll({
        text: data.title,
        inside: true,
        // radius: 15,
        fontSize: "0.9em",
        fill: amGaugeRoot.interfaceColors.get("background")
      });
    });


    // Make stuff animate on load
    chart.appear(1000, 100);
  }

  async buildCustomerRetentionChart() {
    //-----------Trend-Lines-Chart

    console.log('buildCustomerRetentionChart');
    // await this.charts.CustomerRetentionChart.Chart?.dispose();

    // Create root element
    let amTrendLinesRoot = this.rpt.newTrendLinesRoot("CustomerRetentionChart");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    amTrendLinesRoot.setThemes([
      am5themes_Animated.new(amTrendLinesRoot)
    ]);

    amTrendLinesRoot.dateFormatter.setAll({
      dateFormat: "yyyy",
      dateFields: ["valueX"]
    });

    let data = [
      {
        date: "2012-01-01",
        value: 8
      },
      {
        date: "2012-01-02",
        value: 10
      },
      {
        date: "2012-01-03",
        value: 12
      },
      {
        date: "2012-01-04",
        value: 14
      },
      {
        date: "2012-01-05",
        value: 11
      },
      {
        date: "2012-01-06",
        value: 6
      },
      {
        date: "2012-01-07",
        value: 7
      },
      {
        date: "2012-01-08",
        value: 9
      },
      {
        date: "2012-01-09",
        value: 13
      },
      {
        date: "2012-01-10",
        value: 15
      },
      {
        date: "2012-01-11",
        value: 19
      },
      {
        date: "2012-01-12",
        value: 21
      },
      {
        date: "2012-01-13",
        value: 22
      },
      {
        date: "2012-01-14",
        value: 20
      },
      {
        date: "2012-01-15",
        value: 18
      },
      {
        date: "2012-01-16",
        value: 14
      },
      {
        date: "2012-01-17",
        value: 16
      },
      {
        date: "2012-01-18",
        value: 18
      },
      {
        date: "2012-01-19",
        value: 17
      },
      {
        date: "2012-01-20",
        value: 15
      },
      {
        date: "2012-01-21",
        value: 12
      },
      {
        date: "2012-01-22",
        value: 10
      },
      {
        date: "2012-01-23",
        value: 8
      }
    ];

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = amTrendLinesRoot.container.children.push(
      am5xy.XYChart.new(amTrendLinesRoot, this.rpt.AmChartGlobal.trendlinesOpt.Chart)
    );

    let easing = am5.ease.linear;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(amTrendLinesRoot, {
        maxDeviation: 0.5,
        groupData: false,
        baseInterval: {
          timeUnit: "day",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(amTrendLinesRoot, {
          pan: "zoom",
          minGridDistance: 50
        }),
        tooltip: am5.Tooltip.new(amTrendLinesRoot, {})
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(amTrendLinesRoot, {
        maxDeviation: 1,
        renderer: am5xy.AxisRendererY.new(amTrendLinesRoot, { pan: "zoom" })
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(
      am5xy.LineSeries.new(amTrendLinesRoot, {
        minBulletDistance: 10,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(amTrendLinesRoot, {
          pointerOrientation: "horizontal",
          labelText: "{valueY}"
        })
      })
    );

    // Set up data processor to parse string dates
    // https://www.amcharts.com/docs/v5/concepts/data/#Pre_processing_data
    series.data.processor = am5.DataProcessor.new(amTrendLinesRoot, {
      dateFormat: "yyyy-MM-dd",
      dateFields: ["date"]
    });

    series.data.setAll(data);

    series.bullets.push(function () {
      let circle = am5.Circle.new(amTrendLinesRoot, {
        radius: 4,
        fill: series.get("fill"),
        stroke: amTrendLinesRoot.interfaceColors.get("background"),
        strokeWidth: 2
      });

      return am5.Bullet.new(amTrendLinesRoot, {
        sprite: circle
      });
    });

    // createTrendLine(
    //   [
    //     { date: "2012-01-02", value: 10 },
    //     { date: "2012-01-11", value: 19 }
    //   ],
    //   amTrendLinesRoot.interfaceColors.get("positive")
    // );

    // createTrendLine(
    //   [
    //     { date: "2012-01-17", value: 16 },
    //     { date: "2012-01-22", value: 10 }
    //   ],
    //   amTrendLinesRoot.interfaceColors.get("negative")
    // );

    // function createTrendLine(data, color) {
    //   let series = chart.series.push(
    //     am5xy.LineSeries.new(amTrendLinesRoot, {
    //       xAxis: xAxis,
    //       yAxis: yAxis,
    //       valueXField: "date",
    //       stroke: color,
    //       valueYField: "value"
    //     })
    //   );

    //   series.data.processor = am5.DataProcessor.new(amTrendLinesRoot, {
    //     dateFormat: "yyyy-MM-dd",
    //     dateFields: ["date"]
    //   });

    //   series.data.setAll(data);
    //   series.appear(1000, 100);
    // }

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(amTrendLinesRoot, {
      xAxis: xAxis
    }));
    cursor.lineY.set("visible", false);

    // add scrollbar
    chart.set("scrollbarX", am5.Scrollbar.new(amTrendLinesRoot, {
      orientation: "horizontal"
    }));

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000, 100);
    chart.appear(1000, 100);
  }

  async buildRateOfReturnCatergoryChart() {
    //-----------Column-Chart

    console.log('buildRateOfReturnCatergoryChart');
    // await this.charts.RateOfReturnCatergoryChart.Chart?.dispose();

    // Create root element
    let amColumnRoot = this.rpt.newColumnRoot("RateOfReturnCatergoryChart");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    amColumnRoot.setThemes([
      am5themes_Animated.new(amColumnRoot)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = amColumnRoot.container.children.push(am5xy.XYChart.new(amColumnRoot, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX"
    }));


    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set("cursor", am5xy.XYCursor.new(amColumnRoot, {
      behavior: "zoomX"
    }));
    cursor.lineY.set("visible", false);

    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var value = 100;

    function generateData() {
      value = Math.round((Math.random() * 10 - 5) + value);
      am5.time.add(date, "day", 1);
      return {
        date: date.getTime(),
        value: value
      };
    }

    function generateDatas(count) {
      var data = [];
      for (var i = 0; i < count; ++i) {
        data.push(generateData());
      }
      return data;
    }


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(amColumnRoot, {
      maxDeviation: 0,
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(amColumnRoot, {}),
      tooltip: am5.Tooltip.new(amColumnRoot, {})
    }));

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(amColumnRoot, {
      renderer: am5xy.AxisRendererY.new(amColumnRoot, {})
    }));


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(am5xy.ColumnSeries.new(amColumnRoot, {
      name: "Series",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "date",
      tooltip: am5.Tooltip.new(amColumnRoot, {
        labelText: "{valueY}"
      })
    }));



    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set("scrollbarX", am5.Scrollbar.new(amColumnRoot, {
      orientation: "horizontal"
    }));

    var data = generateDatas(5);
    series.data.setAll(data);


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
  }

  async buildNumberOfCustomerChart() {
    //-----------Cluster-Column-Chart

    console.log('buildNumberOfCustomerChart');
    // await this.charts.NumberOfCustomerChart.Chart?.dispose();

    // Create root element
    let amClusterColumnRoot = this.rpt.newClusterColumnRoot("NumberOfCustomerChart");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    amClusterColumnRoot.setThemes([
      am5themes_Animated.new(amClusterColumnRoot)
    ]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = amClusterColumnRoot.container.children.push(am5xy.XYChart.new(amClusterColumnRoot, {
      panX: false,
      panY: false,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: amClusterColumnRoot.verticalLayout
    }));


    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend = chart.children.push(
      am5.Legend.new(amClusterColumnRoot, {
        centerX: am5.p50,
        x: am5.p50
      })
    );

    var data = [{
      "year": "2021",
      "europe": 2.5,
      "namerica": 2.5,
      "asia": 2.1,
      "lamerica": 1,
      "meast": 0.8,
      "africa": 0.4
    }, {
      "year": "2022",
      "europe": 2.6,
      "namerica": 2.7,
      "asia": 2.2,
      "lamerica": 0.5,
      "meast": 0.4,
      "africa": 0.3
    }, {
      "year": "2023",
      "europe": 2.8,
      "namerica": 2.9,
      "asia": 2.4,
      "lamerica": 0.3,
      "meast": 0.9,
      "africa": 0.5
    }]


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(amClusterColumnRoot, {
      categoryField: "year",
      renderer: am5xy.AxisRendererX.new(amClusterColumnRoot, {
        cellStartLocation: 0.1,
        cellEndLocation: 0.9
      }),
      tooltip: am5.Tooltip.new(amClusterColumnRoot, {})
    }));

    xAxis.data.setAll(data);

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(amClusterColumnRoot, {
      renderer: am5xy.AxisRendererY.new(amClusterColumnRoot, {})
    }));


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name, fieldName) {
      var series = chart.series.push(am5xy.ColumnSeries.new(amClusterColumnRoot, {
        name: name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: fieldName,
        categoryXField: "year"
      }));

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}:{valueY}",
        width: am5.percent(90),
        tooltipY: 0
      });

      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      series.bullets.push(function () {
        return am5.Bullet.new(amClusterColumnRoot, {
          locationY: 0,
          sprite: am5.Label.new(amClusterColumnRoot, {
            text: "{valueY}",
            fill: amClusterColumnRoot.interfaceColors.get("alternativeText"),
            centerY: 0,
            centerX: am5.p50,
            populateText: true
          })
        });
      });

      legend.data.push(series);
    }

    makeSeries("Europe", "europe");
    makeSeries("North America", "namerica");
    makeSeries("Asia", "asia");
    makeSeries("Latin America", "lamerica");
    makeSeries("Middle East", "meast");
    makeSeries("Africa", "africa");


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
  }

}
