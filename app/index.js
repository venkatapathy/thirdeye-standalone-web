'use strict';

var fs = require('fs');

var $ = require('jquery'),
    BpmnModeler = require('bpmn-js/lib/Modeler');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var renderer = new BpmnModeler({ container: canvas });

var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

//te register events
var eventBus;

function createNewDiagram() {
  openDiagram(newDiagramXML);
}

function openDiagram(xml) {

  renderer.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }

	var eventBus = renderer.get('eventBus');
	eventBus.on('element.click',function(e) {
		angular.element(document.getElementById('te-properties-panel')).scope().changeElement(e.element.id);
		
	});

  });
 
}

function saveSVG(done) {
  renderer.saveSVG(done);
}

function saveDiagram(done) {

  renderer.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;

      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


////// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

// bootstrap diagram functions

$(document).on('ready', function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var _ = require('lodash');

  var exportArtifacts = _.debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  renderer.on('commandStack.changed', exportArtifacts);
});

//thirdeye functions
	var app = angular.module('thirdeyeangular', ['ngResource']);
	app.factory("Mp", function($resource) {
  		return $resource("http://localhost:12080/thirdeyerest/measuringpoints/:id");
	});
	
	app.factory("MpSave", function($resource) {
  		return $resource("http://localhost:12080/thirdeyerest/measuringpoints/create");
	});
	app.controller('thirdeyectrl', function($scope, Mp,MpSave) {
    		$scope.elementid="sample";
    		$scope.changeElement=function(eid){
    			$scope.elementid=eid;
    			
			//alert(Mp);
			Mp.query({id:eid},function(data){
				$scope.measuringpoints=data;
			});
			
			$scope.$apply();
    		};
		
		$scope.saveMeasuringPoint=function(){
			
			$scope.nmp.mpEId=$scope.elementid;
			
			MpSave.save($scope.nmp,function(){
				$scope.nmp.mpName="";
				$scope.nmp.mpType="";
				Mp.query({id:$scope.elementid},function(data){
					$scope.measuringpoints=data;
					$scope.$apply();
				});
				
			});
			

			
			
		};
	});
