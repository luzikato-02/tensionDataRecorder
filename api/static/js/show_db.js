function operateFormatter(value, row) {
  return '<button class="btn btn-primary tw-download-button" data-id="' + row.id + '">Download</button>';
}

var $table = $('#tw-data-table');

function queryParams(params) {
  return {
      // Additional parameters if needed
      limit: params.limit,
      offset: params.offset,
      order: params.order,
      sort: params.sort
  };
}

var operateEvents = {
  'click .tw-download-button': function (e, value, row, index) {
      // Make an AJAX request to your Flask endpoint to initiate the download
      window.location.href = "/download_tw/" + row.id;
  }
};

$(document).ready(function () {
  $table.bootstrapTable({
      url: "/get_tw_data",
      columns: [
          // ... Your column definitions
      ],
      queryParams: queryParams,
      responseHandler: responseHandler,
      // ... Other Bootstrap Table options
      onClickRow: function (row, $element) {
          // Handle row click event if needed
      }
  });
});