window.onload = () => {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./sw.js');
  }
}

//Clear form once submitted
function clearForm(){
    document.getElementById("form").reset();
}

function submitForm() {
  var formData = $("form").serializeArray();
  let csv = "data:text/csv;charset=utf-8,"; // accept data as CSV
  var field_labels = ['Site Number,', 'Recorders,', 'Date,', 'Surface Visibility,', 'Site Intact %,', 'wind erosion,', 'water erosion,', 'bioturbation,', 'vandalism,', 'land disturbance,', 'other disturbance,','Site Condition Notes,', 'eligible,', 'not eligible,', 'not determined,', 'Basis for Recommendation\n'];
  for (var i = 0; i < field_labels.length; i++) {
    csv += field_labels[i];
  }
  var values = [];
  formData.forEach(function(item) {
    if (item.value == 'on') {
    } else {
    csv += item.value + ","; // concat form value on csv var and add ; to create columns (you can change to , if want)
    values.push(item.value);
    }
  });
  // csv += '\n'
  var encodedUri = encodeURI(csv);

  var downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", values[0]+".csv");
  downloadLink.setAttribute("href", encodedUri);
  document.body.appendChild(downloadLink); // Required for FF
  downloadLink.click();
  downloadLink.remove();

  clearForm();
}

function loadCSV() {
    console.log('Not implemented')
}