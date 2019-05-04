//SEXUAL MISCONDUCT DOTPLOT HISTOGRAM

// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 990 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate = d3.timeParse("%Y");

// Set the ranges
/*var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([1980, 2018]); */
var x = d3.scaleTime()
    .rangeRound([0,width])
    .domain([new Date(1980, 1, 1), new Date(2018, 12, 31)])
var y = d3.scaleLinear()
    .range([height, 0]);

// Adds the svg canvas
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


// add the tooltip area to the webpage
var tooltip = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//function update(){

//var t = d3.transition()
//      .duration(1000);

var file = "data/sexualMisconduct_science.csv"

// Get the data
d3.csv(file, function(error, data) {
    data.forEach(function(d) {
        d.Year = parseDate(d.Year)
        d.Name = d.Name
        d.Outcome = d.Outcome
        d.Color = d.Color
    });

    console.log(data.length);
    // Scale the range of the data
    //x.domain(d3.extent(data, function(d) { return d.Year; }));
    y.domain([0, data.length]);


    // Set up the binning parameters for the histogram
    var nbins = data.length;

    var histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(nbins))
      .value(function(d) { return d.Year;} )

    // Compute the histogram
    //var bins = histogram(data);
    const bins = histogram(data).filter(d => d.length>0)

 //g container for each bin
    let binContainer = svg.selectAll(".gBin")
      .data(bins);

    binContainer.exit().remove()

    let binContainerEnter = binContainer.enter()
      .append("g")
        .attr("class", "gBin")
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

    //need to populate the bin containers with data the first time
    binContainerEnter.selectAll("circle")
        .data(d => d.map((p, i) => {
          return {idx: i,
                  name: p.Name,
                  value: p.Outcome,
                  institution: p["Institution and/or Professional Society"],
                  discipline: p["Discipline or Domain"],
                  color: p.Color,
                  link: p["Link(s)"],
                  //radius: (x(d.x1)-x(d.x0))/2
                  radius: (x(d.x1)-x(d.x0))*1.5
                }
        }))
      .enter()
      .append("circle")
        .attr("class", "enter")
        .attr("cx", 0) //g element already at correct x pos
        .attr("cy", function(d) {
            return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", 0)
        .style("fill", function(d){ return d.color; })
        //.on("mouseover", function(d, i){console.log(value[i])})
        .on("mouseover", tooltipOn)
        //.on("click", tooltipOff)
        .on("mouseout", tooltipOff)
        .on("click", function(d){
          window.open(d.link)
        })
        .transition()
          .duration(500)
          .attr("r", function(d) {
          return (d.length==0) ? 0 : d.radius; })

    binContainerEnter.merge(binContainer)
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

  });//d3.csv
//};//update

/*function color(d){
  d3.select(this)
    .classed("selected", false)
    .style("fill", d.color)
}*/

function tooltipOn(d) {
  //x position of parent g element
  let gParent = d3.select(this.parentElement)
  let translateValue = gParent.attr("transform")

  let gX = translateValue.split(",")[0].split("(")[1] * 50
  //let gX = translateValue.split(",")[0].split
  let gY = height + (+d3.select(this).attr("cy")- 1500)

  d3.select(this)
    .classed("selected", true)
    .style("opacity", .5)
  tooltip.transition()
       .duration(200)
       .style("opacity", .9);
  tooltip.html("<b>" + d.name + "</b>" + "</br>" + d.value + "</br>" + d.institution + "</br>" + d.discipline + "</br>" + "<a href= '" + d.link + "''>" + "</a>")
  //tooltip.html("Hellohellohello")
    .style("left", gX/200 + "px")
    .style("top", gY/3 + "px")
    //console.log(d.Name + "and" + d.Outcome)
    //console.log(this.Name);
}//tooltipOn

function tooltipOff(d) {
  d3.select(this)
      .classed("selected", false)
      .style("fill", function(d){ return d.color; })
      .style("opacity", 1)
    tooltip.transition()
         .duration(500)
         .style("opacity", 0);
}//tooltipOff

// add x axis
svg.append("g")
  .style("font", "12px futura-pt")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .style("stroke", "white")
  .call(d3.axisBottom(x));

//Legend
    var ordinal = d3.scaleOrdinal()
      .domain(["no action", "resigned/retired", "demoted/reprimanded", "suspended", "fired", "lawsuit settled/monetary punishment", "banned from premesis", "death"])
      .range(["#fe0000", "#f7931e", "#f8a395", "#e41a72", "#fcd107", "#f365e7", "#a0581c", "#a90aa1", "#e6d3a5"]);

    var legend = svg.append("g")
        .attr("font-family", "futura-pt")
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .attr("text-anchor", "end")
        .attr("class", ordinal)
      .selectAll("g")
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        .attr("cx", 19)
        .attr("cy", 19);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; }); 


    


//SEXUAL MISCONDUCT CASE STUDIES********************************************************************
var margin1 = {top: 10, right: 30, bottom: 30, left: 30},
    width1 = 1000 - margin1.left - margin1.right,
    height1 = 200 - margin1.top - margin1.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate1 = d3.timeParse("%m/%d/%Y");

// Set the ranges
/*var x = d3.scaleLinear()
    .rangeRound([0, width1])
    .domain([1980, 2018]); */
/*var x1 = d3.scaleTime()
    .rangeRound([0,width1])
    .domain([new Date(1970, 1, 1), new Date(2018, 12, 31)])
var y1 = d3.scaleLinear()
    .range([0, height1]);*/

var x1 = d3.scaleTime()
        .domain([new Date(1970, 1, 1), new Date(2020, 12, 31)])
        .rangeRound([0, width1]);
var x2 = d3.scaleLinear()
    .range([0, width1]);
var y2 = d3.scaleLinear()
    .domain([0, 23])
    .range([0, height1]);

// Adds the svg canvas
var svg1 = d3.select("#chart1")
  .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
    //.style("background-color", 'red');
    .style("background", "img/inder_verma.jpg");

// add the tooltip area to the webpage
var tooltip1 = d3.select("#chart1").append("div")
    .attr("class", "tooltip1")
    .style("opacity", 0);

var file1 = "data/misconduct_caseStudies.csv";

var g1 = svg1.append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

// Get the data
d3.csv(file1, function(error, data) {
    data.forEach(function(d) {
        d.startYear = parseDate1(d.Start)
        d.endYear = parseDate1(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        d.Status = d.Status
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length); 

function getpos(event) {
  var e = window.event;
  xtool = e.clientX + "px";
  ytool = e.clientY + "px";
}

    x1.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#4d4d4d")
      .attr("opacity", 1.0)
      .attr("x", x1(parseDate1("01/01/1970")))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1(parseDate1("01/01/2020")));
    //x1.domain(d3.extent(data, function(d) { return d.End; }));
    //y.domain(data.map(function(d) { return d.Name; })).padding(0.1);

   /*g1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height1 + ")")
        .style("stroke", "white")
        //.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height1]));
*/
    //g1.append("g1")
    //    .attr("class", "y axis")
    //    .call(d3.axisLeft(y));

    g1.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return x1(d.startYear)})
        .attr("height", 50)
        .attr("y", 100)
        //.attr("width", function(d){ return x1(d.end - d.start)})
        .attr("width", function(d) {return x1(d.endYear - d.startYear) + 2;})
        .attr("fill", function(d) {
          if (d.Name == "NA") {
            return "white";
          }
            return "red";
          })
        //.attr("width", function(d) { return x(d.Start); })
        .on("mouseover", function(d){
            tooltip1
              .style("left", x1(d.startYear))
              //.style("top", height1 + (+d3.select(this).attr("y")- 500))
              .style("top", height1+2000)
              .style("opacity", .9)
              .style("display", "inline-block")
              .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
        })
        .on("mouseout", function(d){ tooltip1.style("display", "none");})

      g1.selectAll(".caption")
});

// CHART 2 FRANCISCO AYALA*****************************************************************************

var margin1a = {top: 10, right: 30, bottom: 30, left: 30},
    width1a = 1000 - margin1a.left - margin1a.right,
    height1a = 200 - margin1a.top - margin1a.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate1a = d3.timeParse("%m/%d/%Y");

var x1a = d3.scaleTime()
        .domain([new Date(1970, 1, 1), new Date(2020, 12, 31)])
        .rangeRound([0, width1a]);
var x2a = d3.scaleLinear()
    .range([0, width1a]);
var y2a = d3.scaleLinear()
    .domain([0, 23])
    .range([0, height1a]);

// Adds the svg canvas
var svg1a = d3.select("#chart2")
  .append("svg")
    .attr("width", width1a + margin1a.left + margin1a.right)
    .attr("height", height1a + margin1a.top + margin1a.bottom);

// add the tooltip area to the webpage
var tooltip1 = d3.select("#chart2").append("div")
    .attr("class", "tooltip1")
    .style("opacity", 0);

var file1a = "data/caseStudy_Ayala.csv";

var g1a = svg1a.append("g")
    .attr("transform", "translate(" + margin1a.left + "," + margin1a.top + ")");

// Get the data
d3.csv(file1a, function(error, data) {
    data.forEach(function(d) {
        d.startYear = parseDate1(d.Start)
        d.endYear = parseDate1(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        d.Status = d.Status
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length); 

function getpos(event) {
  var e = window.event;
  xtool = e.clientX + "px";
  ytool = e.clientY + "px";
}

    x1a.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1a.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#4d4d4d")
      .attr("opacity", 1.0)
      .attr("x", x1a(parseDate1a("01/01/1970")))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1a(parseDate1a("01/01/2020")));
    //x1.domain(d3.extent(data, function(d) { return d.End; }));
    //y.domain(data.map(function(d) { return d.Name; })).padding(0.1);

   /*g1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height1 + ")")
        .style("stroke", "white")
        //.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height1]));
*/
    //g1.append("g1")
    //    .attr("class", "y axis")
    //    .call(d3.axisLeft(y));

    var bars = g1a.selectAll(".bar")
        .data(data)
      .enter();

      bars.append("rect")
          .attr("class", "bar")
          .attr("x", function(d){return x1a(d.startYear)})
          .attr("height", 50)
          .attr("y", 100)
          //.attr("width", function(d){ return x1(d.end - d.start)})
          .attr("width", function(d) {return x1a(d.endYear - d.startYear) + 1;})
          .attr("fill", function(d) {
            if (d.Name == "NA") {
              return "white";
            }
              return "red";
            })
          //.attr("width", function(d) { return x(d.Start); })
          .on("mouseover", function(d){
              tooltip1
                .style("left", x1a(d.startYear))
                //.style("top", height1 + (+d3.select(this).attr("y")- 500))
                .style("top", height1a+2000)
                .style("opacity", .9)
                .style("display", "inline-block")
                .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
          })
          .on("mouseout", function(d){ tooltip1.style("display", "none");})

      bars.append('text') //this is where the text code is
              .append('text')
                    .attr("class", "text")
                    .text((d)  => {
                      if (d.Status == "1")
                      return d.Incident
                    })
                    .attr("x", function(d){return x1a(d.startYear)})
                    .attr("y", function(d){
                      if (d.Name == "NA"){
                        return 20;
                      }
                      return 100;
                    })
                    .attr("font-family", "futura-pt")
                    .attr("width",200)
                    .attr("fill", function(d){
                      if (d.Name == "NA") {
                        return "white";
                      }
                        return "red";
                    })
                    /*.attr('transform', (d) => { 
                      if (d.Name =="NA"){
                        return "translate(" + x +"," + 20 + ")";
                      }
                        return "translate(" + x + "," + height1a-20 + ")"; 
                      });*/
});

//CHART 3 LAWRENCE KRAUSS
var margin1b = {top: 10, right: 30, bottom: 30, left: 30},
    width1b = 1000 - margin1b.left - margin1b.right,
    height1b = 200 - margin1b.top - margin1b.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate1b = d3.timeParse("%m/%d/%Y");

var x1b = d3.scaleTime()
        .domain([new Date(1990, 1, 1), new Date(2020, 12, 31)])
        .rangeRound([0, width1b]);
var x2b = d3.scaleLinear()
    .range([0, width1b]);
var y2b = d3.scaleLinear()
    .domain([0, 23])
    .range([0, height1b]);

// Adds the svg canvas
var svg1b = d3.select("#chart3")
  .append("svg")
    .attr("width", width1b + margin1b.left + margin1b.right)
    .attr("height", height1b + margin1b.top + margin1b.bottom);

// add the tooltip area to the webpage
var tooltip1b = d3.select("#chart3").append("div")
    .attr("class", "tooltip1b")
    .style("opacity", 0);

var file1b = "data/caseStudy_Krauss.csv";

var g1b = svg1b.append("g")
    .attr("transform", "translate(" + margin1b.left + "," + margin1b.top + ")");

// Get the data
d3.csv(file1b, function(error, data) {
    data.forEach(function(d) {
        d.startYear = parseDate1(d.Start)
        d.endYear = parseDate1(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length); 

function getpos(event) {
  var e = window.event;
  xtool = e.clientX + "px";
  ytool = e.clientY + "px";
}

    x1b.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1b.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#4d4d4d")
      .attr("opacity", 1.0)
      .attr("x", x1b(parseDate1b("01/01/1990")))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1b(parseDate1b("01/01/2020")));
    //x1.domain(d3.extent(data, function(d) { return d.End; }));
    //y.domain(data.map(function(d) { return d.Name; })).padding(0.1);

   /*g1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height1 + ")")
        .style("stroke", "white")
        //.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height1]));
*/
    //g1.append("g1")
    //    .attr("class", "y axis")
    //    .call(d3.axisLeft(y));

    var bars = g1b.selectAll(".bar")
        .data(data)
      .enter();

      bars.append("rect")
          .attr("class", "bar")
          .attr("x", function(d){return x1b(d.startYear)})
          .attr("height", 50)
          .attr("y", 100)
          //.attr("width", function(d){ return x1(d.end - d.start)})
          .attr("width", function(d) {return x1b(d.endYear - d.startYear) + 1;})
          .attr("fill", function(d) {
            if (d.Name == "NA") {
              return "white";
            }
              return "red";
            })
          //.attr("width", function(d) { return x(d.Start); })
          .on("mouseover", function(d){
              tooltip1b
                .style("left", x1b(100))
                //.style("top", height1 + (+d3.select(this).attr("y")- 500))
                .style("top", height1b+2000)
                .style("opacity", .9)
                .style("display", "inline-block")
                .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
          })
          .on("mouseout", function(d){ tooltip1b.style("display", "none");})

      bars.append('text')
                    .text((d)  => {
                      return d.Name;
                    })
                    .attr('transform', (d) => { return 'translate(' + (100) + ', ' + (300) + ')rotate(90)'; }); // concatinating strings

});




