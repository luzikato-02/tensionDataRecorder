$(document).ready(function () {
  // Initialize Bootstrap Table for TW data
  $("#tw-data-table").bootstrapTable({
    url: "/get_tw_data",
    columns: [
      { field: "id", title: "ID" },
      { field: "operator", title: "Operator" },
      { field: "item_number", title: "Item Number" },
      { field: "machine_number", title: "Machine Number" },
      { field: "rpm", title: "RPM" },
      { field: "tpm", title: "TPM" },
      { field: "stdTen", title: "StdTen" },
      { field: "devTen", title: "DevTen" },
      {
        field: "download",
        title: "Download",
        formatter: function (value, row) {
          return '<button class="btn btn-primary tw-download-button" data-id="' + row.id + '">Download</button>';
        },
        events: {
          'click .tw-download-button': function (e, value, row, index) {
            // Make an AJAX request to your Flask endpoint to initiate the download
            window.location.href = "/download_tw/" + row.id;
          }
        }
      },
      // Add more column configurations
    ],
  });

  // Initialize Bootstrap Table for WV data
  $("#wv-data-table").bootstrapTable({
    url: "/get_wv_data",
    columns: [
      { field: "id", title: "ID" },
      { field: "operator", title: "Operator" },
      { field: "machine_number", title: "Machine Number" },
      { field: "production_order", title: "Production Order" },
      { field: "bale_num", title: "Bale Num" },
      { field: "stdTen", title: "StdTen" },
      { field: "devTen", title: "DevTen" },
      {
        field: "download",
        title: "Download",
        formatter: function (value, row) {
          return '<button class="btn btn-primary wv-download-button" data-id="' + row.id + '">Download</button>';
        },
        events: {
          'click .wv-download-button': function (e, value, row, index) {
            // Make an AJAX request to your Flask endpoint to initiate the download
            window.location.href = "/download_wv/" + row.id;
          }
        }
      },
      // Add more column configurations
    ],
  });
});