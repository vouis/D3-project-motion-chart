var data = [];
var Start_year = config.Start_year;
var End_year = config.End_year;
var Label_r = config.Label_r;
var Speed = config.Speed;

$("#inputfile").change(function () {       //输入的文件改变
$("#inputfile").attr("hidden", true);
var r = new FileReader();                //开始读取
r.readAsText(this.files[0], config.encoding);//读取为文本(开始,格式)

r.onload = function () {
  //读取完成后，数据保存在对象的result属性中
  data = JSON.parse(this.result);

  try {

    console.log(data);

    function x(d) {
      return d.r;
    }

    function y(d) {
      return d.y;
    }

    function radius(d) {
      return d.r;
    }

    function color(d) {
      return d.name;
    }

    function key(d) {
      return d.name;
    }



    // Chart dimensions.
    var margin = {
      top: 19.5,
      right: 55.5,
      bottom: 19.5,
      left: 50.5
    },
      width = 960 - margin.right,
      height = 500 - margin.top - margin.bottom,
      yearMargin = 10;
    var Left_x = config.Left_x;
    var Right_x = config.Right_x;
    var Top_y = config.Top_y;
    var Bottom_y = config.Bottom_y;
    var Left_r = config.Left_r;
    var Right_r = config.Right_r;
    // Various scales. These domains make assumptions of data, naturally.
    var xScale = d3.scale.linear().domain([Left_x, Right_x]).range([0, width]),
      yScale = d3.scale.linear().domain([Bottom_y, Top_y]).range([height, 0]),
      radiusScale = d3.scale.linear().domain([Left_r, Right_r]).range([3, 60]),
      colorScale = d3.scale.category10();

    // The x & y axes.
    formatter = d3.format(".0%");
    var xAxis = d3.svg.axis().orient("bottom").scale(xScale),
      yAxis = d3.svg.axis().scale(yScale).orient("left");


    var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 200)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    //y
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    //title
    svg.append("text")
      .attr("class", "title label")
      .attr("text-anchor", "end")
      .attr("x", margin.left + 250)
      .attr("y", margin.bottom + 500)
      .text(config.Label_title);

    //x-axis label.
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height - 6)
      .text(config.Label_x);

    // Add a y-axis label.
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text(config.Label_y);

    // Add the year label; the value is set on transition.
    var label = svg.append("text")
      .attr("class", "year label")
      .attr("text-anchor", "end")
      .attr("y", height - 24)
      .attr("x", width)
      .text(Start_year);



    // Load the data.
    drawMotionChart(data);

    function drawMotionChart(nations) {




      var bisect = d3.bisector(function (d) {
        return d[0];
      });

      // Add a dot per nation. Initialize the data at 1990, and set the colors.
      var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");


      var dots = svg.append("g")
        .attr("class", "dots");

      var dot = dots.selectAll(".dot")
        .data(interpolateData(End_year))
        .enter().append("circle")
        .attr("class", "dot")
        .style("fill", function (d) {
          return colorScale(color(d));
        })
        //鼠标交互

        .on("mouseover", function (d) {
          tooltip.html(d.name + "<br>" + d.r);
          tooltip.attr('class', 'd3-tip');
          return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function (d) {
          tooltip.html(d.name + "<br>" + d.r);
          return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function (d) {
          return tooltip.style("visibility", "hidden");
        })
        .call(position)
        .sort(order);



      // Start a transition that interpolates the data based on year.
      svg.transition()
        .duration(1000 * Speed)
        .ease("linear")
        .tween("year", tweenYear);


      function position(dot) {
        dot.attr("cx", function (d) {
          return xScale(x(d));

        })
          .attr("cy", function (d) {
            return yScale(y(d));
          })
          .attr("r", function (d) {
            return radiusScale(radius(d));
          });
      }

      // Defines a sort order so that the smallest dots are drawn on top.
      function order(a, b) {
        return radius(b) - radius(a);
      }


      function tweenYear() {
        var year = d3.interpolateNumber(Start_year, End_year);
        return function (t) {
          displayYear(year(t));
        };
      }

      function displayYear(year) {
        dot.data(interpolateData(year), key).call(position).sort(order);
        label.text(Math.round(year));
      }


      function interpolateData(year) {
        return nations.map(function (d) {
          return {
            name: d.name,
            years: interpolateValues(d.years, year),
            r: interpolateValues(d.r, year),
            y: interpolateValues(d.y, year),
            x: interpolateValues(d.x, year)
          };
        });
      }

      // Finds (and possibly interpolates) the value for the specified year.
      function interpolateValues(values, year) {
        var i = bisect.left(values, year, 0, values.length - 1),
          a = values[i];
        if (i > 0) {
          var b = values[i - 1],
            t = (year - a[0]) / (b[0] - a[0]);
          return a[1] * (1 - t) + b[1] * t;
        }
        return a[1];
      }
    }

  } catch (error) {
    alert(error);
  }
};
});
