//  Month names for labeling
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function drawHeatmap(tempType, data) {
  console.log(tempType);

  // Define color scales for max and min temperatures
  const colorScales = {
    max_temperature: d3
      .scaleSequential(d3.interpolateOranges)
      .domain(d3.extent(data, (d) => d.max_temperature)),
    min_temperature: d3
      .scaleSequential(d3.interpolateBlues)
      .domain(d3.extent(data, (d) => d.min_temperature)),
  };

  // Create SVG container
  const svg = d3.select("#level-1").attr("width", 1000).attr("height", 800);

  // Define margins and dimensions
  const margin = { top: 50, right: 30, bottom: 70, left: 100 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  // Create a group element to hold the chart contents
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define the months and years for the axes
  const years = [...new Set(data.map((d) => d.year))].reverse(); // Unique years, reversed order

  // Create x-axis scale (months)
  const xScale = d3
    .scaleBand()
    .domain(d3.range(1, 13))
    .range([0, width])
    .padding(0.05);

  // Create y-axis scale (years)
  const yScale = d3.scaleBand().domain(years).range([0, height]).padding(0.05);

  // Append x-axis
  g.append("g")
    .selectAll(".x-axis")
    .data(d3.range(1, 13))
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d) + xScale.bandwidth() / 2)
    .attr("y", height + 5)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text((d) => monthNames[d - 1]);

  // Append y-axis
  g.append("g")
    .selectAll(".y-axis")
    .data(years)
    .enter()
    .append("text")
    .attr("x", -10)
    .attr("y", (d) => yScale(d) + yScale.bandwidth() / 2)
    .attr("dy", "0.5em")
    .attr("text-anchor", "end")
    .text((d) => d);

  // Create the heatmap cells (rectangles)
  g.selectAll(".heatmap-cell")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.month))
    .attr("y", (d) => yScale(d.year))
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScales[tempType](d[tempType]))
    .attr("stroke", "white")
    .attr("stroke-width", 0.5)
    .append("title")
    .text(
      (d) =>
        `${monthNames[d.month - 1]}-${d.year}\nMax: ${
          d.max_temperature
        }°C\nMin: ${d.min_temperature}°C`
    );

  const legendWidth = 20;
  const legendHeight = 100;

  // Append a group for the legend
  const legendGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left + width + 10},${margin.top})`);

  // Define the color gradient
  const legendScale = d3
    .scaleSequential(
      tempType === "max_temperature"
        ? d3.interpolateOranges
        : d3.interpolateBlues
    )
    .domain(
      d3.extent(data, (d) =>
        tempType === "max_temperature" ? d.max_temperature : d.min_temperature
      )
    );

  // Create a rectangle to represent the color scale
  legendGroup
    .selectAll("rect")
    .data(d3.range(legendHeight)) // Create an array of y-positions for the gradient
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => d)
    .attr("width", legendWidth)
    .attr("height", 1)
    .attr("fill", (d) => legendScale(d)); // Map the y-position to the color scale
}

// Level 1
function level1_viz(data, tempType) {
  drawHeatmap(tempType, data);
  // Temperature Selector
  const radioButtons = document.querySelectorAll(
    'input[name="temperature_l1"]'
  );
  radioButtons.forEach((button) => {
    button.addEventListener("change", () => {
      // Update the selected value whenever the radio button changes
      let selectedTemp_l1 = document.querySelector(
        'input[name="temperature_l1"]:checked'
      ).value;
      level1_viz(data, selectedTemp_l1);
    });
  });
}

function drawLevel2Heatmap(data, tempType) {
  const mainContainer = document.getElementById("level-2-container");
  const availableYears = [...Array(2017 - 2008 + 1)].map((_, i) => 2008 + i);

  const highestMaxTemp = d3.max(data, (entry) => entry.max_temperature);
  const lowestMaxTemp = d3.min(data, (entry) => entry.max_temperature);
  const maxTempColorScale = d3
    .scaleSequential(d3.interpolateOranges)
    .domain(d3.extent(data, (entry) => entry.max_temperature));

  const highestMinTemp = d3.max(data, (entry) => entry.min_temperature);
  const lowestMinTemp = d3.min(data, (entry) => entry.min_temperature);
  const minTempColorScale = d3
    .scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(data, (entry) => entry.min_temperature));

  const xAxisScale = d3.scaleBand().domain(availableYears).range([0, 870]);
  const yAxisScale = d3.scaleBand().domain(monthNames).range([0, 700]);

  // Add axes
  d3.select(mainContainer.querySelector("#x-axis")).call(
    d3.axisTop(xAxisScale)
  );
  d3.select(mainContainer.querySelector("#y-axis")).call(
    d3.axisLeft(yAxisScale)
  );

  // Create legend
  const showMaxTemperature = tempType === "max_temperature";
  const colorScale = showMaxTemperature ? maxTempColorScale : minTempColorScale;
  const minTemperature = showMaxTemperature ? lowestMaxTemp : lowestMinTemp;
  const maxTemperature = showMaxTemperature ? highestMaxTemp : highestMinTemp;

  const colorLegendGroup = d3.select(
    mainContainer.querySelector("#color-legend")
  );

  // Create color gradient for legend
  for (let i = 0; i < 10; i++) {
    const value =
      minTemperature + (maxTemperature - minTemperature) * (i / (10 - 1));
    colorLegendGroup
      .append("rect")
      .attr("y", i * (200 / 10))
      .attr("width", 30)
      .attr("height", 200 / 10)
      .attr("fill", colorScale(value));
  }

  // Add labels to legend
  colorLegendGroup
    .append("text")
    .attr("x", 30 + 5)
    .attr("y", 0)
    .text(`${minTemperature}`);

  colorLegendGroup
    .append("text")
    .attr("x", 30 + 5)
    .attr("y", 200)
    .text(`${maxTemperature}`);

  const gridContainer = mainContainer.querySelector("#grid-container");

  const svgWidth = 80; // Width of each cell
  const svgHeight = 51; // Height of each cell
  const spacing = 8; // Spacing between each grid cell

  // Create the tooltip element
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 1)")
    .style("color", "white")
    .style("padding", "5px")
    .style("font-size", "10px");

  for (let monthIndex = 0; monthIndex < monthNames.length; monthIndex++) {
    for (let yearIndex = 0; yearIndex < availableYears.length; yearIndex++) {
      const currentRow = data.filter(
        (entry) =>
          entry.year === availableYears[yearIndex] &&
          entry.month === monthIndex + 1
      )[0];

      // Create an SVG element for each grid cell
      const svg = d3
        .select(gridContainer)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("x", 50 + yearIndex * (svgWidth + spacing)) // Position horizontally based on yearIndex
        .attr("y", 50 + monthIndex * (svgHeight + spacing)); // Position vertically based on monthIndex

      if (currentRow != undefined) {
        // Get temperature values for plotting lines
        const maxTempValues = currentRow.maxTempsPerMonth.map(
          (temperature, day) => ({
            day: day + 1,
            temperature: temperature,
          })
        );

        const minTempValues = currentRow.minTempsPerMonth.map(
          (temperature, day) => ({
            day: day + 1,
            temperature: temperature,
          })
        );

        // Create a heatmap cell (rect)
        const color = colorScale(
          showMaxTemperature
            ? currentRow.max_temperature
            : currentRow.min_temperature
        );
        svg
          .append("rect")
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .attr("fill", color)
          .attr("stroke", "#ddd")
          .on("mouseover", function (event) {
            // Get the temperatures
            const minTemp = currentRow.min_temperature;
            const maxTemp = currentRow.max_temperature;

            // Show the tooltip with year, month, min, and max temperatures
            tooltip
              .style("visibility", "visible")
              .html(
                `${monthNames[monthIndex]}-${availableYears[yearIndex]}<br>Min Temp: ${minTemp}°C<br>Max Temp: ${maxTemp}°C`
              )
              .style("top", event.pageY + 5 + "px") // Position the tooltip below the mouse pointer
              .style("left", event.pageX + 5 + "px"); // Position the tooltip to the right of the mouse pointer
          })
          // Mouseout event to hide the tooltip
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          });

        // Add line plots for max and min temperatures
        const lineGenerator = d3
          .line()
          .x((d) => (d.day / 31) * svgWidth) // Scale to fit the grid (31 days)
          .y(
            (d) =>
              svgHeight -
              ((d.temperature - lowestMaxTemp) /
                (highestMaxTemp - lowestMaxTemp)) *
                svgHeight
          ); // Scale temperature values to fit height

        // Max temperature line (green)
        svg
          .append("path")
          .data([maxTempValues])
          .attr("d", lineGenerator)
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("stroke-width", 2);

        // Min temperature line (sky blue)
        svg
          .append("path")
          .data([minTempValues])
          .attr("d", lineGenerator)
          .attr("fill", "none")
          .attr("stroke", "skyblue")
          .attr("stroke-width", 2);
      }
    }
  }
}

// Level 2
function level2_viz(data, tempType) {
  drawLevel2Heatmap(data, tempType);
  // Temperature Selector
  const radioButtons = document.querySelectorAll(
    'input[name="temperature_l2"]'
  );
  radioButtons.forEach((button) => {
    button.addEventListener("change", () => {
      // Update the selected value whenever the radio button changes
      let selectedTemp_l2 = document.querySelector(
        'input[name="temperature_l2"]:checked'
      ).value;
      level2_viz(data, selectedTemp_l2);
    });
  });
}

// Data Loading and Processing
d3.csv("temperature_daily.csv")
  .then((temperatureData) => {
    // Convert date strings to actual Date objects and extract year/month
    temperatureData.forEach((d) => {
      const [year, month, _] = d.date.split("-");
      d.year = parseInt(year, 10);
      d.month = parseInt(month, 10);
    });

    // Aggregate data: Compute max and min temperatures for each (year, month) pair
    const data = Array.from(
      d3.rollup(
        temperatureData,
        (val) => ({
          maxTemp: d3.max(val, (entry) => parseInt(entry.max_temperature)),
          minTemp: d3.min(val, (entry) => parseInt(entry.min_temperature)),
          maxTempsPerMonth: val.map((entry) => parseInt(entry.max_temperature)),
          minTempsPerMonth: val.map((entry) => parseInt(entry.min_temperature)),
        }),
        (entry) => entry.year, // Group by year
        (entry) => entry.month // Then group by month
      ),
      ([year, months]) =>
        Array.from(months, ([month, temps]) => ({
          year,
          month,
          max_temperature: temps.maxTemp,
          min_temperature: temps.minTemp,
          maxTempsPerMonth: temps.maxTempsPerMonth,
          minTempsPerMonth: temps.minTempsPerMonth,
        }))
    ).flat(); // Flatten the nested arrays into a single array

    Promise.all([
      level1_viz(data, "max_temperature"),
      level2_viz(data, "max_temperature"),
    ])
      .then(() => {
        console.log("Both actions have been completed.");
      })
      .catch((error) => {
        console.error("Error in one or both actions:", error);
      });
  })
  .catch((error) => {
    console.error("Error loading the CSV file:", error);
  });
