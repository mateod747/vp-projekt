//https://mateod747.github.io/vp-projekt/

var w = 600;
var h = 450;
var graph = 400;

var projection = d3.geo.mercator() 
					   .center([ 13, 52 ]) 
					   .translate([ w/2, h/2 ]) 
					   .scale([ w/1.5 ]);

var path = d3.geo.path()
				 .projection(projection);

var svg = d3.select("#mapid")
			.append("svg")
			.attr("width", w)
      .attr("height", h);

d3.json("ne_50m_admin_0_countries_simplified.json", function(json) {    //https://www.toptal.com/javascript/a-map-to-perfection-using-d3-js-to-make-beautiful-web-maps
  var data = topojson.feature(json, json.features);
	svg.selectAll("path")
	   .data(json.features)
	   .enter()
	   .append("path")
	   .attr("d", path)
	   .attr("stroke", "black")
     .attr("fill", "#FF0000")
     .attr("opacity", .6)
     .on("mouseover", function(d) {
        d3.select(this).attr({
          changeElementColor(this);,
          cursor: "pointer"
        }),
        mouseover(data.inner[d.properties.place]);
       })
     .on("mouseout", function(d) {
          d3.select(this).attr({
            changeElementColor1(this);, 
            });   
        mouseout(data.inner[d.properties.place]);
       })  

function changeElementColor(d3Element){
        d3Element
        .transition().duration(0)
          .attr("opacity", 1)
    }


function changeElementColor1(d3Element){
      d3Element
      .transition().duration(0)
        .attr("opacity", .6)
  }

var data = [["Spain", ["Paella", "Real Madrid C.F.", "FC Barcelona", "Madrid", "Pablo Picasso"]], 
            ["UK", ["Fish and Chips", "Liverpool F.C.", "Man Utd F.C.", "London", "Da Queen"]],
            ["Germany", ["Bratwurst", "FC Bayern München", "Berlin", "Beer", "Hitla"]],
            ["France", ["Baguettes", "Paris Saint-Germain FC", "La Marseillaise", "Paris", "Napoleon"]],
            ["Italy", ["Pizza", "A.C. Milan", "Roma", "Michelangelo", "Da Vinci", "Mafia"]],
            ["Croatia", ["Sarma", "HNL = lopovi", "Nikola Tesla", "Zagreb", "Dubrovnik"]],
            ["Poland", ["Pierozki", "Warszaw"]],
            ["Russia", ["Pirog", "PFK CSKA Moskva", "Moskva", "Vladimir Putin", "Vodka"]],
            ["Portugal", ["Caldo Verde", "FC Porto", "Lisboa", "Ronaldo", "Magellan"]],
            ["Sweden", ["Räksmörgås", "Stockholm", "Ibrahimović"]]];

var outer = d3.map();
var inner = [];
var links = [];

var outerId = [0];
 
data.forEach(function(d){
	
	if (d == null)
        return;
    
    i = { id: 'i' + inner.length, name: d[0], related_links: [] };
    i.related_nodes = [i.id];
	inner.push(i);
	
	d[1].forEach(function(d1){
		
		o = outer.get(d1);
		
		if (o == null)
		{
			o = { name: d1,	id: 'o' + outerId[0], related_links: [] };
			o.related_nodes = [o.id];
			outerId[0] = outerId[0] + 1;	
			
			outer.set(d1, o);
		}
		
		l = { id: 'l-' + i.id + '-' + o.id, inner: i, outer: o }
		links.push(l);
		
		i.related_nodes.push(o.id);
		i.related_links.push(l.id);
		o.related_nodes.push(i.id);
		o.related_links.push(l.id);
	});
});

data = {
	inner: inner,
	outer: outer.values(),
	links: links
}

outer = data.outer;
data.outer = Array(outer.length);


var i1 = 0;
var i2 = outer.length - 1;

for (var i = 0; i < data.outer.length; ++i)
{
	if (i % 2 == 1)
		data.outer[i2--] = outer[i];
	else
		data.outer[i1++] = outer[i];
}

var diameter = 700;
var rect_width = 70;
var rect_height = 20;

var link_width = "1px"; 

var il = data.inner.length;

var inner_y = d3.scale.linear()
    .domain([0, il])
    .range([-(il * rect_height)/2, (il * rect_height)/2]);          //https://www.d3indepth.com/scales/

mid = (data.outer.length/2.0)
var outer_x = d3.scale.linear()
    .domain([0, mid, mid, data.outer.length])
    .range([15, 170, 190 ,355]);

data.outer = data.outer.map(function(d, i) { 
    d.x = outer_x(i);
    d.y = diameter/3;
    return d;
});

data.inner = data.inner.map(function(d, i) { 
    d.x = -(rect_width / 2);
    d.y = inner_y(i);
    return d;
});

function projectX(x)
{
    return ((x - 90) / 180 * Math.PI) - (Math.PI/2);
}

var diagonal = d3.svg.diagonal()
    .source(function(d) { return {"x": d.outer.y * Math.cos(projectX(d.outer.x)), 
                                  "y": -d.outer.y * Math.sin(projectX(d.outer.x))}; })            
    .target(function(d) { return {"x": d.inner.y + rect_height/2,
                                  "y": d.outer.x > 180 ? d.inner.x : d.inner.x + rect_width}; })
    .projection(function(d) { return [d.y, d.x]; });


var svgCircle = d3.select("#graphid").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var link = svgCircle.append('g').attr('class', 'links').selectAll(".link")
    .data(data.links)
  .enter().append('path')
    .attr('class', 'link')
    .attr('id', function(d) { return d.id })
    .attr("d", diagonal)
    .attr('stroke', function(d,i) { console.log(i); return "#FF0000"; }) 
    .attr('stroke-width', link_width);

var onode = svgCircle.append('g').selectAll(".outer_node")
    .data(data.outer)
  .enter().append("g")
    .attr("class", "outer_node")
    .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);
  
onode.append("circle")
    .attr('id', function(d) { return d.id })
    .style('fill', 'gray')
    .style('stroke', 'black')
    .attr("r", 4.5);
  
onode.append("circle")
    .attr('r', 20)

    .attr('visibility', 'hidden');
  
onode.append("text")
	.attr('id', function(d) { return d.id + '-txt'; })
    .attr("dy", ".31em")
    .attr('fill', '#a1a1a1')
    .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
    .text(function(d) { return d.name; });
  

var letssee = "";

console.log(data.inner[0])
  
var inode = svgCircle.append('g').selectAll(".inner_node")
    .data(data.inner)
  .enter().append("g")
    .attr("class", "inner_node")
    .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"})
    .on("mouseover", function(d) {
      mouseover(d),
      letssee = d.name,
      d3.selectAll("path").data(json.features)
      .filter(function(D) {
        return D.properties.node == letssee;
      })
      .attr("fill", "#b00000")
    })
    .on("mouseout", function(d) {
      mouseout(d),
      d3.selectAll("path").data(json.features)
      .filter(function(D) {
        return D.properties.node == letssee;
      })
      .attr("fill", "#FF0000")
    });
  
inode.append('rect')
    .attr('width', rect_width)
    .attr('height', rect_height)
    .attr('id', function(d) { return d.id; })
    .attr('cursor', 'pointer')
    .attr('fill', 'black');
  
inode.append("text")
	.attr('id', function(d) { return d.id + '-txt'; })
    .attr('text-anchor', 'middle')
    .attr('cursor', 'pointer')
    .attr('fill', '#a1a1a1')
    .attr("transform", "translate(" + rect_width/2 + ", " + rect_height * .75 + ")")
    .text(function(d) { return d.name; });


d3.select(self.frameElement).style("height", diameter - 150 + "px");

function mouseover(d)
{
	d3.selectAll('.links .link').sort(function(a, b){ return d.related_links.indexOf(a.id); });	
	
    for (var i = 0; i < d.related_nodes.length; i++)
    {
        d3.select('#' + d.related_nodes[i]).attr('stroke', 'red');
        d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'bold').attr("fill", "white");
    }
    
    for (var i = 0; i < d.related_links.length; i++)
        d3.select('#' + d.related_links[i]).attr('stroke-width', '5px');
}

function mouseout(d)
{   	
    for (var i = 0; i < d.related_nodes.length; i++)
    {
        d3.select('#' + d.related_nodes[i]).attr('stroke', 'none');
        d3.select('#' + d.related_nodes[i] + '-txt').attr("font-weight", 'normal').attr('fill', '#a1a1a1');
    }
    
    for (var i = 0; i < d.related_links.length; i++)
        d3.select('#' + d.related_links[i]).attr('stroke-width', link_width);
}

});




