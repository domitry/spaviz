/*global require, module, _, d3*/

module.exports = function(){
    d3.select("#dialog_wrapper").style("display", "flex");
    d3.select("#viz_bg").style("display", "block");
    
    function setup_advanced(){
	d3.select("#simple_form").style("display", "none");

	d3.select("#advanced_form")	
	    .style("display", "block")
	    .on("submit", function(){
		
	    });
    }
	
    function setup_simple(){
	d3.select("#advanced_form").style("display", "none");
	
	d3.select("#simple_form")
	    .style("display", "block")
	    .on("submit", function(){
		d3.event.preventDefault();
		var keyword = d3.select("#simple_text")[0][0].value;
		window.location.search="?mode=search&keyword=" + keyword;
	    });
    }

    d3.select("#link_simple")
	.on("mouseup", function(){
	    setup_simple();
	});
    
    d3.select("#link_advanced")
	.on("mouseup", function(){
	    setup_advanced();
	});

    if(window.location.hash == "#advanced"){
	setup_advanced();
    }else{
	setup_simple();
    }
};
