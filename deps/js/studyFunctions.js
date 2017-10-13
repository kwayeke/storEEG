/*

  This file contains all of the functions required for management/creation of studies

*/

// misc. functions

function exitProgram() {
	ipcRenderer.send('exit-clicked');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function tsvJSON(tsv){

  var lines=tsv.split("\n");

  var result = [];

  var headers=lines[0].split("\t");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split("\t");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }

  return result; //JavaScript object
  //return JSON.stringify(result); //JSON
}

function importTSVFile(filePath) {
	var imports = fs.readFileSync(filePath, 'utf8');
	return tsvJSON(imports);
}

// Function for initial study creation

function createNewStudy(studyData) {
	if(!fs.existsSync(path.join(studyFolder, studyData.Name))) {
		fs.mkdirSync(path.join(studyFolder, studyData.Name));
	};

	for(var k in studyData) {
		currentStudy[k] = studyData[k];
	};

	if(currentStudy.subject    == undefined){ currentStudy.subject      = [];};
	if(currentStudy.event      == undefined){ currentStudy.event        = [];};
	if(currentStudy.parameters == undefined){ currentStudy.parameters   = [];};
	if(currentStudy.task       == undefined){ currentStudy.task         = [];};
	if(currentStudy.stimulus   == undefined){ currentStudy.stimulus     = [];};
	if(currentStudy.uuid       == undefined){ currentStudy.uuid         = uuid();};
	if(currentStudy.recordings == undefined){ currentStudy.recordings   = [];};

	jsonfile.writeFileSync(path.join(studyFolder, studyData.Name, 'dataset_description.json'), studyData);
};

// updates list of recordings on the add recording page

function updateRecordingsList(files) {
	for(var i = 0; i < files.length; i++) {
		var tempLI = $("<li class='small-text'>" + files[i].name + "     " + "</li>");
		//var tempButton = $("<button class='btn btn-xs btn-danger recording-list-remove-btn'>Remove</button>");
		var tempButton = $("<a class='recording-list-remove-btn ml-2'><i class='fa fa-trash-o' aria-hidden='true'></i></a>");
		tempLI.data().file = files[i].path;
		tempButton.click(function() {
			$(this).parent().remove();
		});
		$("#recordings-added-display-list").append(tempLI.append(tempButton));
	};
}

// Creates elements for edit study info containers
// dataObject => study item object w/ all fields for its type in addition to 'type' field

function createStudyInfoElement(dataObject) {

	var tempvar = $("<div></div>");
	tempvar.addClass('study-info-object');
	tempvar.addClass('col-5 m-1 bg-primary text-light')
	tempvar.text(dataObject.label);
	tempvar.data('studyElement', dataObject);

	var removebtn = $("<a class='recording-list-remove-btn'><i class='fa fa-trash-o' aria-hidden='true'></i></a>");
	removebtn.click(function() {
		$(this).parent().remove();
	});

	var editbtn   = $("<a class='mx-1 study-element-edit-btn'><i class='fa fa-pencil-square-o' aria-hidden='true'></i></a>");
	editbtn.click(function(e) {
		e.preventDefault();

		$('#addNewModal .modal-body').load('./forms/' + dataObject.type + '.html');
		$('#addNewModalLabel').text('Add New ' + capitalizeFirstLetter(dataObject.type));
		$('#addNewModal').data('currentInfoType', dataObject.type);
		$('#addNewModal').data('editing', $(this).parent());
		$('#addNewModal').data('mode', 'edit');

		$('#addNewModal').on('shown.bs.modal', function(e) {
			if($(e.currentTarget).data('mode') == 'edit') {
				var temp = $(e.currentTarget).data('editing').data('studyElement');

				for(elm in temp) {
					//$('.modal-body .form-group > :not(label)[name='+elm+']')[0].value = temp[elm];
					$('.modal-body .form-group > :not(label)[name='+elm+']').val(temp[elm]);
				};
			};
		});

		$('#addNewModal').modal('show');

	});

	tempvar.append(editbtn);
	tempvar.append(removebtn);

	$('#study-info-' + dataObject.type + '>.study-info-element-container').append(tempvar)

};

/*

Data management functions below

Used to load, store, and modify data stored in .json files on local machine


*/


function containsItem(dataType, item, study){ // returns true if 'study' contains 'item' of type 'dataType', false otherwise

	var studyItems = study[dataType];

	for(var i=0; i < studyItems.length; i++) {

		if(_.isEqualWith(item, studyItems[i], studyComparison)) {
			return true;
		}

	};

	return false;

}

function findMatchingStudies(dataType, item) { // returns list of studies that have element 'item' in them



}

function loadStudies() {

	studies = jsonfile.readFileSync('studies.json', {
		throws: false
	});

	if(studies == null) {
		studies = [];
		jsonfile.writeFileSync('studies.json', studies);
	};

}

function saveStudies() {

	jsonfile.writeFile('studies.json', studies);

}

function addStudy(study) {

	loadStudies();
	studies.push(study);
	jsonfile.writeFile('studies.json', studies);

}

function studyComparison(one, two, key) {
	if(key==='uuid') {
		return true;
	};
	if(key==='study'){
		return true;
	};
}


/*

  Functions for creating and managing drag n drop functionality

*/



/*

  Functions for creating and managing the main page table

*/

function createHomeTable() {

	var data = [];

	loadStudies();

	for(var i=0; i < studies.length; i++) {

		data.push({
			name: studies[i].Name,
			description: studies[i].studyDescription,
			numSubjects: studies[i].subject.length,
			numStimuli: studies[i].stimulus.length,
			uuid: studies[i].uuid
		});

	};

	$('#home-table').bootstrapTable({
		columns: [{
			field: 'name',
			title: 'Study',
			sortable: true,
			formatter: createEditLink
		}, {
			field: 'numSubjects',
			title: 'Number of Subjects',
			sortable: true
		}, {
			field: 'numStimuli',
			title: 'Number of Stimuli',
			sortable: true
		}, {
			field: 'description',
			title: 'Study Description',
			sortable: false
		}, {
			field: 'uuid',
			title: 'UUID',
			sortable: false,
			visible: false
		}],
		search: true,
		pagination: true,
		showToggle: true,
		showRefresh: true,
		showColumns: true,
		iconsPrefix: 'fa',
		icons: {
			paginationSwitchDown: 'fa-collapse-down icon-chevron-down',
			paginationSwitchUp: 'fa-collapse-up icon-chevron-up',
			refresh: 'fa-refresh icon-refresh',
			toggle: 'fa-list-alt icon-list-alt',
			columns: 'fa-th icon-th',
			detailOpen: 'fa-plus icon-plus',
			detailClose: 'fa-minus icon-minus'
		},
		data
	});

	$('[title="Refresh"]').on('click', (event) => {
		event.preventDefault()
		updateHomeTable()
	});
}

function updateHomeTable() {

	var data = [];

	loadStudies();

	for(var i=0; i < studies.length; i++) {

		data.push({
			name: studies[i].Name,
			description: studies[i].studyDescription,
			numSubjects: studies[i].subject.length,
			numStimuli: studies[i].stimulus.length
		});

	};

	if(~_.isEmpty(data)) {
		$('#home-table').bootstrapTable('load', data)
	} else {
		$('#home-table').bootstrapTable('removeAll')
	};

}

function createEditLink(text, row, column) {

	return [
		'<a href="#">',
		text,
		'</a>'
	].join('');

}

/*

	End table section

*/

function hideAllSections() {
	$("#main-area > div").hide() // Hide all sections
}